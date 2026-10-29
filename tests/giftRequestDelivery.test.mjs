import assert from "node:assert/strict";
import test from "node:test";

import { giftRequestSchema } from "../src/domain/gift-request/giftRequest.ts";
import {
  deliverGiftRequest,
  GiftRequestDeliveryError,
} from "../src/server/gift-request/delivery.ts";

const request = giftRequestSchema.parse({
  configuration: {
    recipientName: "Bea",
    euSize: 39,
    colors: { stripe1: "56", stripe2: "01", ankle: "97", sole: "02" },
  },
  requester: {
    name: "Maria",
    email: "maria@example.com",
    whatsappPhone: "+351912345678",
  },
  christmasMessage: "Cosy wishes",
  contactConsent: true,
});

const environment = {
  RESEND_API_KEY: "re_test",
  GIFT_REQUEST_FROM_EMAIL: "Christmas Slippers <wishes@example.com>",
  GIFT_REQUEST_TO_EMAIL: "workshop@example.com",
};

test("fails safely when Resend configuration is missing", async () => {
  await assert.rejects(
    deliverGiftRequest(request, { environment: {} }),
    (error) =>
      error instanceof GiftRequestDeliveryError &&
      error.reason === "configuration",
  );
});

test("uses validated reply-to and reports provider acceptance", async () => {
  let sentPayload;
  const result = await deliverGiftRequest(request, {
    environment,
    sendEmail: async (payload) => {
      sentPayload = payload;
      return { data: { id: "email_123" }, error: null };
    },
  });

  assert.equal(result.providerRequestId, "email_123");
  assert.equal(sentPayload.replyTo, "maria@example.com");
  assert.deepEqual(sentPayload.to, ["workshop@example.com"]);
  assert.match(sentPayload.html, /\+351912345678/);
  assert.match(sentPayload.text, /\+351912345678/);
});

test("supports a safe retry after provider failure without changing content", async () => {
  const attempts = [];
  const sendEmail = async (payload, options) => {
    attempts.push({ payload, options });
    return attempts.length === 1
      ? { data: null, error: { message: "temporary failure" } }
      : { data: { id: "email_retry" }, error: null };
  };

  await assert.rejects(
    deliverGiftRequest(request, { environment, sendEmail }),
    (error) =>
      error instanceof GiftRequestDeliveryError && error.reason === "provider",
  );
  await deliverGiftRequest(request, { environment, sendEmail });

  assert.equal(attempts.length, 2);
  assert.deepEqual(attempts[0], attempts[1]);
});

