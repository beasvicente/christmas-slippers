import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../src/app/api/gift-requests/route.ts";

function postRequest(body, options = {}) {
  return new Request("https://example.com/api/gift-requests", {
    method: "POST",
    headers: {
      "Content-Type": options.contentType ?? "application/json",
      "x-forwarded-for": options.address ?? "192.0.2.10",
      ...(options.contentLength
        ? { "Content-Length": String(options.contentLength) }
        : {}),
    },
    body,
  });
}

test("rejects unsupported request media types", async () => {
  const response = await POST(
    postRequest("plain text", {
      contentType: "text/plain",
      address: "192.0.2.11",
    }),
  );

  assert.equal(response.status, 415);
});

test("rejects declared request bodies above the size limit", async () => {
  const response = await POST(
    postRequest("{}", {
      contentLength: 20_000,
      address: "192.0.2.12",
    }),
  );
  const result = await response.json();

  assert.equal(response.status, 413);
  assert.match(result.error, /too large/i);
});

test("rejects malformed and incomplete gift requests", async () => {
  const malformed = await POST(
    postRequest("{", { address: "192.0.2.13" }),
  );
  const incomplete = await POST(
    postRequest(JSON.stringify({ requester: {} }), {
      address: "192.0.2.14",
    }),
  );

  assert.equal(malformed.status, 400);
  assert.equal(incomplete.status, 400);
});

test("quietly accepts a populated honeypot without sending email", async () => {
  const response = await POST(
    postRequest(JSON.stringify({ website: "https://bot.example" }), {
      address: "192.0.2.15",
    }),
  );
  const result = await response.json();

  assert.equal(response.status, 202);
  assert.equal(result.status, "accepted");
});

