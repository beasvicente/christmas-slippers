
import assert from "node:assert/strict";
import test from "node:test";

import {
  verifyGiftRequestChallenge,
  BotProtectionConfigurationError,
  BotProtectionUnavailableError,
} from "../src/server/gift-request/botProtection.ts";

import {
  reserveDailyGiftRequestQuota,
  releaseDailyGiftRequestQuota,
  DailyQuotaConfigurationError,
  DailyQuotaUnavailableError,
} from "../src/server/gift-request/dailyQuota.ts";

const request = new Request(
  "https://christmas-slippers.vercel.app/api/gift-requests",
  {method: "POST"},
);

const turnstileEnvironment = {
  TURNSTILE_SECRET_KEY: "test-secret",
  TURNSTILE_ALLOWED_HOSTNAMES:
    "christmas-slippers.vercel.app,localhost",
};

const quotaEnvironment = {
  NODE_ENV: "production",
  UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "test-token",
  GIFT_REQUEST_DAILY_QUOTA: "2",
};

const fixedDate = new Date("2026-12-01T12:00:00Z");

function turnstileResponse(overrides = {}) {
  return Response.json({
    success: true,
    action: "gift-request",
    hostname: "christmas-slippers.vercel.app",
    ...overrides,
  });
}

/**
 * Simulates the Redis counter and atomic EVAL operations.
 * Each test gets an isolated in-memory counter.
 */
function fakeRedis() {
  let count = 0;
  let reservations = 0;
  let releases = 0;

  const fetcher = async (_url, options) => {
    const command = JSON.parse(options.body);

    assert.equal(command[0], "EVAL");

    const script = command[1];

    if (script.includes("EXPIREAT")) {
      reservations += 1;

      const limit = Number(command[4]);

      if (count >= limit) {
        return Response.json({
          result: [0, count, 3600],
        });
      }

      count += 1;

      return Response.json({
        result: [1, count, 3600],
      });
    }

    if (script.includes("DECR")) {
      releases += 1;
      count = Math.max(0, count - 1);

      return Response.json({result: 1});
    }

    throw new Error("Unexpected Redis command");
  };

  return {
    fetcher,
    get count() {
      return count;
    },
    get reservations() {
      return reservations;
    },
    get releases() {
      return releases;
    },
  };
}

// ------------------------------------------------------------
// Cloudflare Turnstile
// ------------------------------------------------------------

test("accepts a valid Turnstile challenge", async () => {
  let calls = 0;

  const valid = await verifyGiftRequestChallenge(
    request,
    "valid-test-token",
    {
      environment: turnstileEnvironment,
      fetcher: async (url, options) => {
        calls += 1;

        assert.equal(
          url,
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        );

        assert.equal(options.method, "POST");

        const body = new URLSearchParams(options.body);

        assert.equal(body.get("secret"), "test-secret");
        assert.equal(body.get("response"), "valid-test-token");

        return turnstileResponse();
      },
    },
  );

  assert.equal(valid, true);
  assert.equal(calls, 1);
});

test("rejects missing Turnstile tokens without calling Cloudflare", async () => {
  let calls = 0;

  const valid = await verifyGiftRequestChallenge(
    request,
    "",
    {
      environment: turnstileEnvironment,
      fetcher: async () => {
        calls += 1;
        return turnstileResponse();
      },
    },
  );

  assert.equal(valid, false);
  assert.equal(calls, 0);
});

test("rejects oversized Turnstile tokens", async () => {
  const valid = await verifyGiftRequestChallenge(
    request,
    "x".repeat(2049),
    {
      environment: turnstileEnvironment,
      fetcher: async () => {
        throw new Error("Cloudflare must not be called");
      },
    },
  );

  assert.equal(valid, false);
});

test("rejects failed or expired Turnstile challenges", async () => {
  const valid = await verifyGiftRequestChallenge(
    request,
    "expired-token",
    {
      environment: turnstileEnvironment,
      fetcher: async () =>
        turnstileResponse({
          success: false,
          "error-codes": ["timeout-or-duplicate"],
        }),
    },
  );

  assert.equal(valid, false);
});

test("rejects Turnstile challenges with an incorrect action", async () => {
  const valid = await verifyGiftRequestChallenge(
    request,
    "test-token",
    {
      environment: turnstileEnvironment,
      fetcher: async () =>
        turnstileResponse({action: "other-action"}),
    },
  );

  assert.equal(valid, false);
});

test("rejects challenges from unauthorised hostnames", async () => {
  const valid = await verifyGiftRequestChallenge(
    request,
    "test-token",
    {
      environment: turnstileEnvironment,
      fetcher: async () =>
        turnstileResponse({hostname: "attacker.example"}),
    },
  );

  assert.equal(valid, false);
});

test("fails closed when Turnstile configuration is missing", async () => {
  await assert.rejects(
    () =>
      verifyGiftRequestChallenge(request, "token", {
        environment: {},
      }),
    BotProtectionConfigurationError,
  );
});

test("fails closed when Cloudflare is unavailable", async () => {
  await assert.rejects(
    () =>
      verifyGiftRequestChallenge(request, "token", {
        environment: turnstileEnvironment,
        fetcher: async () => {
          throw new Error("Network unavailable");
        },
      }),
    BotProtectionUnavailableError,
  );
});

// ------------------------------------------------------------
// Global daily email quota
// ------------------------------------------------------------

test("allows submissions below the daily quota", async () => {
  const redis = fakeRedis();

  const first = await reserveDailyGiftRequestQuota({
    environment: quotaEnvironment,
    fetcher: redis.fetcher,
    now: fixedDate,
  });

  const second = await reserveDailyGiftRequestQuota({
    environment: quotaEnvironment,
    fetcher: redis.fetcher,
    now: fixedDate,
  });

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(redis.count, 2);

  assert.ok(first.reservationKey);
  assert.equal(first.reservationKey, second.reservationKey);
});

test("rejects submissions above the daily quota", async () => {
  const redis = fakeRedis();

  await reserveDailyGiftRequestQuota({
    environment: quotaEnvironment,
    fetcher: redis.fetcher,
    now: fixedDate,
  });

  await reserveDailyGiftRequestQuota({
    environment: quotaEnvironment,
    fetcher: redis.fetcher,
    now: fixedDate,
  });

  const third = await reserveDailyGiftRequestQuota({
    environment: quotaEnvironment,
    fetcher: redis.fetcher,
    now: fixedDate,
  });

  assert.equal(third.allowed, false);
  assert.equal(third.retryAfter, 3600);
  assert.equal(redis.count, 2);
});

test("does not exceed the quota with concurrent reservations", async () => {
  const redis = fakeRedis();

  const results = await Promise.all(
    Array.from({length: 10}, () =>
      reserveDailyGiftRequestQuota({
        environment: quotaEnvironment,
        fetcher: redis.fetcher,
        now: fixedDate,
      }),
    ),
  );

  assert.equal(
    results.filter((result) => result.allowed).length,
    2,
  );

  assert.equal(
    results.filter((result) => !result.allowed).length,
    8,
  );

  assert.equal(redis.count, 2);
});

test("releases a reserved quota slot after a definite failure", async () => {
  const redis = fakeRedis();

  const first = await reserveDailyGiftRequestQuota({
    environment: quotaEnvironment,
    fetcher: redis.fetcher,
    now: fixedDate,
  });

  assert.equal(first.allowed, true);
  assert.ok(first.reservationKey);

  await releaseDailyGiftRequestQuota(
    first.reservationKey,
    {
      environment: quotaEnvironment,
      fetcher: redis.fetcher,
    },
  );

  assert.equal(redis.count, 0);
  assert.equal(redis.releases, 1);

  const retry = await reserveDailyGiftRequestQuota({
    environment: quotaEnvironment,
    fetcher: redis.fetcher,
    now: fixedDate,
  });

  assert.equal(retry.allowed, true);
});

test("fails closed when production Redis configuration is missing", async () => {
  await assert.rejects(
    () =>
      reserveDailyGiftRequestQuota({
        environment: {
          NODE_ENV: "production",
          GIFT_REQUEST_DAILY_QUOTA: "2",
        },
        now: fixedDate,
      }),
    DailyQuotaConfigurationError,
  );
});

test("fails closed when Redis is unavailable", async () => {
  await assert.rejects(
    () =>
      reserveDailyGiftRequestQuota({
        environment: quotaEnvironment,
        now: fixedDate,
        fetcher: async () => {
          throw new Error("Redis unavailable");
        },
      }),
    DailyQuotaUnavailableError,
  );
});

test("rejects invalid daily quota configuration", async () => {
  await assert.rejects(
    () =>
      reserveDailyGiftRequestQuota({
        environment: {
          ...quotaEnvironment,
          GIFT_REQUEST_DAILY_QUOTA: "0",
        },
        now: fixedDate,
      }),
    DailyQuotaConfigurationError,
  );
});
