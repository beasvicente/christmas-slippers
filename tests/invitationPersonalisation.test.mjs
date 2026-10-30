import assert from "node:assert/strict";
import test from "node:test";

import {normaliseInvitationName} from "../src/server/invitation/model.ts";
import {createInvitation, resolveInvitation, revokeInvitation} from "../src/server/invitation/service.ts";
import {listInvitationRecords} from "../src/server/invitation/store.ts";
import {INVITATION_TOKEN_BYTES, generateInvitationToken, hashInvitationToken} from "../src/server/invitation/token.ts";

const environment = {
  UPSTASH_REDIS_REST_URL: "https://redis.example.com",
  UPSTASH_REDIS_REST_TOKEN: "private-test-credential",
};

function createRedisMock() {
  const values = new Map();
  const sets = new Map();
  const requestBodies = [];

  return {
    requestBodies,
    fetcher: async (_url, init) => {
      const commands = JSON.parse(String(init.body));
      requestBodies.push(String(init.body));
      const results = commands.map(([command, ...args]) => {
        if (command === "SET") {
          values.set(args[0], args[1]);
          return {result: "OK"};
        }
        if (command === "SADD") {
          const set = sets.get(args[0]) ?? new Set();
          set.add(args[1]);
          sets.set(args[0], set);
          return {result: 1};
        }
        if (command === "GET") return {result: values.get(args[0]) ?? null};
        if (command === "SMEMBERS") return {result: [...(sets.get(args[0]) ?? [])]};
        if (command === "MGET") return {result: args.map((key) => values.get(key) ?? null)};
        return {error: "Unsupported test command"};
      });
      return Response.json(results);
    },
  };
}

function fixedToken(byte) {
  return Buffer.alloc(INVITATION_TOKEN_BYTES, byte).toString("base64url");
}

test("generates opaque invitation tokens with 256 bits of entropy", () => {
  const first = generateInvitationToken();
  const second = generateInvitationToken();
  assert.notEqual(first, second);
  assert.equal(Buffer.from(first, "base64url").byteLength, INVITATION_TOKEN_BYTES);
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
});

test("normalises accented names and rejects markup or unbounded input", () => {
  assert.equal(normaliseInvitationName("  Mari\u0061\u0301   João  "), "Mariá João");
  assert.equal(normaliseInvitationName("D’Ávila"), "D’Ávila");
  assert.throws(() => normaliseInvitationName("<img src=x onerror=alert(1)>"));
  assert.throws(() => normaliseInvitationName("A".repeat(51)));
});

test("stores only a token hash and resolves a valid private invitation", async () => {
  const redis = createRedisMock();
  const token = fixedToken(7);
  const created = await createInvitation(
    {recipientFirstName: "  Teste  "},
    {environment, fetcher: redis.fetcher, generateToken: () => token, now: new Date("2026-11-01T12:00:00Z")},
  );
  const resolved = await resolveInvitation(token, {
    environment,
    fetcher: redis.fetcher,
    now: new Date("2026-11-02T12:00:00Z"),
  });

  assert.equal(created.record.recipientFirstName, "Teste");
  assert.deepEqual(resolved, {recipientFirstName: "Teste"});
  assert.doesNotMatch(redis.requestBodies.join("\n"), new RegExp(token));
  assert.match(redis.requestBodies[0], new RegExp(hashInvitationToken(token)));
  assert.match(redis.requestBodies[0], /christmas-slippers:invitation:v1:/);
  assert.doesNotMatch(redis.requestBodies[0], /gift-request:/);

  const listed = await listInvitationRecords({environment, fetcher: redis.fetcher});
  assert.equal(listed.length, 1);
  assert.equal(listed[0].record.recipientFirstName, "Teste");
  assert.equal(listed[0].id.length, 12);
});

test("stores and resolves a valid generic invitation without a recipient name", async () => {
  const redis = createRedisMock();
  const token = fixedToken(8);
  const created = await createInvitation(
    {recipientFirstName: null},
    {environment, fetcher: redis.fetcher, generateToken: () => token, now: new Date("2026-11-01T12:00:00Z")},
  );
  const resolved = await resolveInvitation(token, {environment, fetcher: redis.fetcher});

  assert.equal(created.record.recipientFirstName, null);
  assert.deepEqual(resolved, {recipientFirstName: null});
  assert.doesNotMatch(redis.requestBodies.join("\n"), new RegExp(token));
});

test("rejects missing, malformed, unknown, expired, and revoked invitation tokens", async () => {
  const redis = createRedisMock();
  assert.equal(await resolveInvitation(undefined, {environment, fetcher: redis.fetcher}), null);
  assert.equal(await resolveInvitation("not-a-token", {environment, fetcher: redis.fetcher}), null);
  assert.equal(await resolveInvitation(fixedToken(9), {environment, fetcher: redis.fetcher}), null);

  const expiredToken = fixedToken(10);
  await createInvitation(
    {recipientFirstName: "Expired", expiresAt: new Date("2026-12-01T00:00:00Z")},
    {environment, fetcher: redis.fetcher, generateToken: () => expiredToken, now: new Date("2026-11-01T00:00:00Z")},
  );
  assert.equal(await resolveInvitation(expiredToken, {
    environment,
    fetcher: redis.fetcher,
    now: new Date("2026-12-02T00:00:00Z"),
  }), null);

  const revokedToken = fixedToken(11);
  await createInvitation(
    {recipientFirstName: "Revoked"},
    {environment, fetcher: redis.fetcher, generateToken: () => revokedToken},
  );
  assert.equal(await revokeInvitation(revokedToken, {environment, fetcher: redis.fetcher}), true);
  assert.equal(await resolveInvitation(revokedToken, {environment, fetcher: redis.fetcher}), null);
});

test("keeps simultaneous invitation lookups isolated", async () => {
  const redis = createRedisMock();
  const firstToken = fixedToken(12);
  const secondToken = fixedToken(13);
  await Promise.all([
    createInvitation({recipientFirstName: "Alpha"}, {environment, fetcher: redis.fetcher, generateToken: () => firstToken}),
    createInvitation({recipientFirstName: "Beta"}, {environment, fetcher: redis.fetcher, generateToken: () => secondToken}),
  ]);
  const [first, second] = await Promise.all([
    resolveInvitation(firstToken, {environment, fetcher: redis.fetcher}),
    resolveInvitation(secondToken, {environment, fetcher: redis.fetcher}),
  ]);
  assert.deepEqual(first, {recipientFirstName: "Alpha"});
  assert.deepEqual(second, {recipientFirstName: "Beta"});
});

test("fails closed without exposing storage errors to invitation visitors", async () => {
  assert.equal(await resolveInvitation(fixedToken(14), {environment: {}}), null);
  assert.equal(await resolveInvitation(fixedToken(14), {
    environment,
    fetcher: async () => new Response(null, {status: 503}),
  }), null);
});
