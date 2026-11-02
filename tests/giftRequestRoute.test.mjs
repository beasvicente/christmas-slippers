
import assert from "node:assert/strict";
import test from "node:test";

import {
  createGiftRequestPostHandler,
} from "../src/server/gift-request/handler.ts";

function postRequest(body, options = {}) {
  return new Request("https://example.com/api/gift-requests", {
    method: "POST",
    headers: {
      "Content-Type": options.contentType ?? "application/json",
      "x-forwarded-for": options.address ?? "192.0.2.10",
      ...(options.contentLength
        ? {"Content-Length": String(options.contentLength)}
        : {}),
      ...(options.acceptLanguage
        ? {"Accept-Language": options.acceptLanguage}
        : {}),
    },
    body,
  });
}

// Creates an isolated handler with delivery explicitly enabled
// for tests. No real email, Turnstile, or Redis calls are needed
// to exercise request validation and honeypot behaviour.
function createValidationHandler() {
  return createGiftRequestPostHandler({
    environment: {
      NODE_ENV: "test",
      GIFT_REQUEST_DELIVERY_ENABLED: "true",
    },
    checkRateLimit: async () => ({
      allowed: true,
      retryAfter: 0,
    }),
  });
}

// ------------------------------------------------------------
// Security: delivery kill switch
// ------------------------------------------------------------

test("disables gift requests by default", async () => {
  const handler = createGiftRequestPostHandler({
    environment: {
      NODE_ENV: "test",
    },
  });

  const response = await handler(
    postRequest(JSON.stringify({requester: {}})),
  );

  const result = await response.json();

  assert.equal(response.status, 503);
  assert.equal(result.code, "deliveryDisabled");
});

test("disables gift requests when delivery is explicitly false", async () => {
  const handler = createGiftRequestPostHandler({
    environment: {
      NODE_ENV: "test",
      GIFT_REQUEST_DELIVERY_ENABLED: "false",
    },
  });

  const response = await handler(
    postRequest(JSON.stringify({requester: {}})),
  );

  const result = await response.json();

  assert.equal(response.status, 503);
  assert.equal(result.code, "deliveryDisabled");
});

// ------------------------------------------------------------
// HTTP request validation
// ------------------------------------------------------------

test("rejects unsupported request media types", async () => {
  const handler = createValidationHandler();

  const response = await handler(
    postRequest("plain text", {
      contentType: "text/plain",
      address: "192.0.2.11",
    }),
  );

  assert.equal(response.status, 415);
});

test("rejects declared request bodies above the size limit", async () => {
  const handler = createValidationHandler();

  const response = await handler(
    postRequest("{}", {
      contentLength: 20_000,
      address: "192.0.2.12",
    }),
  );

  const result = await response.json();

  assert.equal(response.status, 413);
  assert.equal(result.code, "tooLarge");
  assert.match(result.error, /too large/i);
});

test("rejects malformed and incomplete gift requests", async () => {
  const handler = createValidationHandler();

  const malformed = await handler(
    postRequest("{", {
      address: "192.0.2.13",
    }),
  );

  const incomplete = await handler(
    postRequest(
      JSON.stringify({requester: {}}),
      {address: "192.0.2.14"},
    ),
  );

  assert.equal(malformed.status, 400);
  assert.equal(incomplete.status, 400);

  const malformedResult = await malformed.json();
  const incompleteResult = await incomplete.json();

  assert.equal(malformedResult.code, "unreadable");
  assert.equal(incompleteResult.code, "validation");
});

test("localises safe API and validation errors from Accept-Language", async () => {
  const handler = createValidationHandler();

  const response = await handler(
    postRequest(
      JSON.stringify({requester: {}}),
      {
        address: "192.0.2.16",
        acceptLanguage: "pt-PT,pt;q=0.9",
      },
    ),
  );

  const result = await response.json();

  assert.equal(response.status, 400);
  assert.equal(result.code, "validation");
  assert.match(result.error, /Revê os campos/);
  assert.match(result.fields["requester.name"], /teu nome/);
});

// ------------------------------------------------------------
// Bot protection: honeypot
// ------------------------------------------------------------

test("quietly accepts a populated honeypot without sending email", async () => {
  let deliveryCalls = 0;
  let challengeCalls = 0;
  let quotaCalls = 0;

  const handler = createGiftRequestPostHandler({
    environment: {
      NODE_ENV: "test",
      GIFT_REQUEST_DELIVERY_ENABLED: "true",
    },
    checkRateLimit: async () => ({
      allowed: true,
      retryAfter: 0,
    }),
    verifyChallenge: async () => {
      challengeCalls += 1;
      return true;
    },
    reserveQuota: async () => {
      quotaCalls += 1;
      return {
        allowed: true,
        retryAfter: 0,
        reservationKey: "test-reservation",
      };
    },
    deliver: async () => {
      deliveryCalls += 1;
    },
  });

  const response = await handler(
    postRequest(
      JSON.stringify({
        website: "https://bot.example",
      }),
      {address: "192.0.2.15"},
    ),
  );

  const result = await response.json();

  assert.equal(response.status, 202);
  assert.equal(result.status, "accepted");

  // Honeypot submissions must not reach external services.
  assert.equal(deliveryCalls, 0);
  assert.equal(challengeCalls, 0);
  assert.equal(quotaCalls, 0);
});
