import assert from "node:assert/strict";
import test from "node:test";

import { giftRequestSchema } from "../src/domain/gift-request/giftRequest.ts";

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
    ...overrides,
  };
}

test("normalises a valid gift request and international WhatsApp number", () => {
  const result = giftRequestSchema.parse(validRequest());

  assert.equal(result.requester.email, "maria@example.com");
  assert.equal(result.requester.whatsappPhone, "+351912345678");
});

test("allows an empty optional WhatsApp number and Christmas message", () => {
  const request = validRequest({
    requester: {
      name: "Maria",
      email: "maria@example.com",
      whatsappPhone: "",
    },
    christmasMessage: "",
  });
  const result = giftRequestSchema.parse(request);

  assert.equal(result.requester.whatsappPhone, undefined);
  assert.equal(result.christmasMessage, undefined);
});

test("rejects malformed international WhatsApp numbers", () => {
  const request = validRequest({
    requester: {
      name: "Maria",
      email: "maria@example.com",
      whatsappPhone: "+999 12",
    },
  });

  assert.equal(giftRequestSchema.safeParse(request).success, false);
});

test("rejects unsupported sizes and unknown yarn IDs", () => {
  const invalidSize = validRequest({
    configuration: { ...validRequest().configuration, euSize: 99 },
  });
  const invalidColour = validRequest({
    configuration: {
      ...validRequest().configuration,
      colors: { ...validRequest().configuration.colors, sole: "999" },
    },
  });

  assert.equal(giftRequestSchema.safeParse(invalidSize).success, false);
  assert.equal(giftRequestSchema.safeParse(invalidColour).success, false);
});

test("allows one legitimate yarn colour in every region", () => {
  const request = validRequest({
    configuration: {
      ...validRequest().configuration,
      colors: {
        stripe1: "56",
        stripe2: "56",
        ankle: "56",
        sole: "56",
      },
    },
  });

  assert.equal(giftRequestSchema.safeParse(request).success, true);
});

test("requires requester name, valid email and explicit contact consent", () => {
  const missingName = validRequest({
    requester: { name: " ", email: "maria@example.com" },
  });
  const invalidEmail = validRequest({
    requester: { name: "Maria", email: "not-an-email" },
  });
  const noConsent = validRequest({ contactConsent: false });

  assert.equal(giftRequestSchema.safeParse(missingName).success, false);
  assert.equal(giftRequestSchema.safeParse(invalidEmail).success, false);
  assert.equal(giftRequestSchema.safeParse(noConsent).success, false);
});

test("enforces requester and message length boundaries", () => {
  assert.equal(
    giftRequestSchema.safeParse(
      validRequest({
        requester: { name: "N".repeat(80), email: "maria@example.com" },
        christmasMessage: "M".repeat(500),
      }),
    ).success,
    true,
  );
  assert.equal(
    giftRequestSchema.safeParse(
      validRequest({
        requester: { name: "N".repeat(81), email: "maria@example.com" },
      }),
    ).success,
    false,
  );
  assert.equal(
    giftRequestSchema.safeParse(
      validRequest({ christmasMessage: "M".repeat(501) }),
    ).success,
    false,
  );
});

