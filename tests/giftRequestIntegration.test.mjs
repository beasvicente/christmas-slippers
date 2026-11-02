
import assert from "node:assert/strict";
import test from "node:test";

import {
  createGiftRequestPostHandler,
} from "../src/server/gift-request/handler.ts";

import {
  GiftRequestDeliveryError,
} from "../src/server/gift-request/delivery.ts";

// ------------------------------------------------------------
// Test fixtures
// ------------------------------------------------------------

function validRequest(overrides = {}) {
  return {
    configuration: {
      recipientName: "Bea",
      euSize: 39,
      colors: {
        stripe1: "56",
        stripe2: "01",
        ankle: "97",
        sole: "02",
      },
    },
    requester: {
      name: "Maria",
      email: "MARIA@example.com",
      whatsappPhone: "+351 912 345 678",
    },
    christmasMessage: "A cosy surprise, please.",
    contactConsent: true,
    turnstileToken: "valid-test-token",
    ...overrides,
  };
}

function postRequest(payload = validRequest()) {
  return new Request(
    "https://example.com/api/gift-requests",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en",
        "x-forwarded-for": "192.0.2.50",
      },
      body: JSON.stringify(payload),
    },
  );
}

const testEnvironment = {
  NODE_ENV: "test",
  GIFT_REQUEST_DELIVERY_ENABLED: "true",
};

// Every dependency is mocked to avoid real network requests.
function createTestDependencies(overrides = {}) {
  return {
    environment: testEnvironment,

    checkRateLimit: async () => ({
      allowed: true,
      retryAfter: 0,
    }),

    verifyChallenge: async () => true,

    reserveQuota: async () => ({
      allowed: true,
      retryAfter: 0,
      reservationKey: "test-reservation",
    }),

    releaseQuota: async () => {},

    deliver: async () => {},

    ...overrides,
  };
}

// ------------------------------------------------------------
// 1. Successful protected submission
// ------------------------------------------------------------

test(
  "valid submission verifies Turnstile, reserves quota and sends one email",
  async () => {
    const sequence = [];
    let deliveryCalls = 0;

    const handler = createGiftRequestPostHandler(
      createTestDependencies({
        verifyChallenge: async (_request, token) => {
          sequence.push("turnstile");
          assert.equal(token, "valid-test-token");
          return true;
        },

        reserveQuota: async () => {
          sequence.push("quota");

          return {
            allowed: true,
            retryAfter: 0,
            reservationKey: "test-reservation",
          };
        },

        deliver: async (giftRequest) => {
          sequence.push("delivery");
          deliveryCalls += 1;

          assert.equal(
            giftRequest.requester.email,
            "maria@example.com",
          );

          assert.equal(
            giftRequest.configuration.recipientName,
            "Bea",
          );

          // The Turnstile token must never be emailed.
          assert.equal(
            "turnstileToken" in giftRequest,
            false,
          );
        },
      }),
    );

    const response = await handler(postRequest());
    const result = await response.json();


    assert.equal(response.status, 202);
    assert.equal(result.status, "accepted");
    assert.equal(deliveryCalls, 1);

    assert.deepEqual(sequence, [
      "turnstile",
      "quota",
      "delivery",
    ]);
  },
);

// ------------------------------------------------------------
// 2. Invalid Turnstile challenge
// ------------------------------------------------------------

test(
  "invalid Turnstile challenge prevents quota reservation and email",
  async () => {
    let quotaCalls = 0;
    let deliveryCalls = 0;

    const handler = createGiftRequestPostHandler(
      createTestDependencies({
        verifyChallenge: async () => false,

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
      }),
    );

    const response = await handler(
      postRequest(
        validRequest({
          turnstileToken: "invalid-token",
        }),
      ),
    );

    const result = await response.json();

    assert.equal(response.status, 403);
    assert.equal(result.code, "botChallenge");

    assert.equal(quotaCalls, 0);
    assert.equal(deliveryCalls, 0);
  },
);

// ------------------------------------------------------------
// 3. Exhausted daily quota
// ------------------------------------------------------------

test(
  "exhausted daily quota prevents email delivery",
  async () => {
    let challengeCalls = 0;
    let deliveryCalls = 0;

    const handler = createGiftRequestPostHandler(
      createTestDependencies({
        verifyChallenge: async () => {
          challengeCalls += 1;
          return true;
        },

        reserveQuota: async () => ({
          allowed: false,
          retryAfter: 3600,
        }),

        deliver: async () => {
          deliveryCalls += 1;
        },
      }),
    );

    const response = await handler(postRequest());
    const result = await response.json();

    assert.equal(response.status, 429);
    assert.equal(result.code, "dailyQuota");
    assert.equal(
      response.headers.get("Retry-After"),
      "3600",
    );

    assert.equal(challengeCalls, 1);
    assert.equal(deliveryCalls, 0);
  },
);

// ------------------------------------------------------------
// 4. Definite email configuration failure
// ------------------------------------------------------------

test(
  "definite delivery configuration failure releases the quota slot",
  async () => {
    let releaseCalls = 0;
    let releasedKey = null;

    // Construct an error with the same runtime type and reason
    // checked by the handler, without depending on constructor
    // arguments that may change in delivery.ts.
    const configurationError = Object.assign(
      Object.create(GiftRequestDeliveryError.prototype),
      {
        name: "GiftRequestDeliveryError",
        message: "Email provider is not configured",
        reason: "configuration",
      },
    );

    const handler = createGiftRequestPostHandler(
      createTestDependencies({
        releaseQuota: async (reservationKey) => {
          releaseCalls += 1;
          releasedKey = reservationKey;
        },

        deliver: async () => {
          throw configurationError;
        },
      }),
    );

    const response = await handler(postRequest());
    const result = await response.json();

    assert.equal(response.status, 503);
    assert.equal(result.code, "unavailable");

    assert.equal(releaseCalls, 1);
    assert.equal(releasedKey, "test-reservation");
  },
);

// ------------------------------------------------------------
// 5. Ambiguous delivery failure
// ------------------------------------------------------------

test(
  "ambiguous email delivery failure retains the quota reservation",
  async () => {
    let releaseCalls = 0;
    let deliveryCalls = 0;

    const handler = createGiftRequestPostHandler(
      createTestDependencies({
        releaseQuota: async () => {
          releaseCalls += 1;
        },

        deliver: async () => {
          deliveryCalls += 1;
          throw new Error("Provider connection timed out");
        },
      }),
    );

    const response = await handler(postRequest());
    const result = await response.json();

    assert.equal(response.status, 502);
    assert.equal(result.code, "delivery");

    assert.equal(deliveryCalls, 1);

    // The provider may have accepted the email before timing out.
    // Keep the quota reservation to limit duplicate attempts.
    assert.equal(releaseCalls, 0);
  },
);
