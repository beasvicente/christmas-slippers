import assert from "node:assert/strict";
import test from "node:test";

import { giftRequestSchema } from "../src/domain/gift-request/giftRequest.ts";
import { renderGiftRequestEmail } from "../src/server/gift-request/email.ts";

const request = giftRequestSchema.parse({
  configuration: {
    recipientName: "Bea <script>alert(1)</script>",
    euSize: 39,
    colors: {
      stripe1: "56",
      stripe2: "01",
      ankle: "97",
      sole: "02",
    },
  },
  requester: {
    name: "Maria & João",
    email: "maria@example.com",
    whatsappPhone: "+351 912 345 678",
  },
  christmasMessage: "Warm wishes <img src=x onerror=alert(1)>",
  contactConsent: true,
});

test("renders trusted catalogue details and contact data in HTML and text", () => {
  const email = renderGiftRequestEmail(request);

  for (const value of [
    "DROPS Snow 56 · christmas red",
    "DROPS Snow 01 · off white",
    "DROPS Snow 97 · dark ivy",
    "DROPS Snow 02 · black",
    "+351912345678",
  ]) {
    assert.match(email.html, new RegExp(value.replace(/[+]/g, "\\+")));
    assert.match(email.text, new RegExp(value.replace(/[+]/g, "\\+")));
  }
});

test("escapes untrusted content before inserting it into HTML", () => {
  const email = renderGiftRequestEmail(request);

  assert.doesNotMatch(email.html, /<script>|<img src=/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.html, /Maria &amp; João/);
  assert.match(email.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

