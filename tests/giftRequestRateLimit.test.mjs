import assert from "node:assert/strict";
import test from "node:test";

import {
  checkGiftRequestRateLimit,
  RateLimitConfigurationError,
  RateLimitUnavailableError,
} from "../src/server/gift-request/rateLimit.ts";

function request(address = "203.0.113.7") {
  return new Request("https://example.com/api/gift-requests", {
    headers: { "x-forwarded-for": address },
  });
}

test("fails closed when durable production rate limiting is not configured", async () => {
  await assert.rejects(
    checkGiftRequestRateLimit(request(), {
      environment: { NODE_ENV: "production" },
    }),
    RateLimitConfigurationError,
  );
});

test("uses the durable rate-limit count without sending raw addresses", async () => {
  let receivedBody = "";
  const result = await checkGiftRequestRateLimit(request(), {
    environment: {
      NODE_ENV: "production",
      UPSTASH_REDIS_REST_URL: "https://redis.example.com",
      UPSTASH_REDIS_REST_TOKEN: "secret-token",
      GIFT_REQUEST_RATE_LIMIT_SECRET: "hashing-secret",
    },
    fetcher: async (_url, init) => {
      receivedBody = String(init.body);
      return Response.json([
        { result: 6 },
        { result: 0 },
        { result: 420 },
      ]);
    },
  });

  assert.equal(result.allowed, false);
  assert.equal(result.retryAfter, 420);
  assert.doesNotMatch(receivedBody, /203\.0\.113\.7/);
});

test("fails safely when the durable limiter is unavailable", async () => {
  await assert.rejects(
    checkGiftRequestRateLimit(request(), {
      environment: {
        NODE_ENV: "production",
        UPSTASH_REDIS_REST_URL: "https://redis.example.com",
        UPSTASH_REDIS_REST_TOKEN: "secret-token",
        GIFT_REQUEST_RATE_LIMIT_SECRET: "hashing-secret",
      },
      fetcher: async () => new Response(null, { status: 503 }),
    }),
    RateLimitUnavailableError,
  );
});

