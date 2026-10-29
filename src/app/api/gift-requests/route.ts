import { giftRequestSubmissionSchema } from "../../../domain/gift-request/index";
import {
  deliverGiftRequest,
  GiftRequestDeliveryError,
} from "../../../server/gift-request/delivery";
import {
  checkGiftRequestRateLimit,
  RateLimitConfigurationError,
  RateLimitUnavailableError,
} from "../../../server/gift-request/rateLimit";

const MAX_BODY_BYTES = 16 * 1024;

class InvalidRequestBodyError extends Error {
  readonly reason: "invalid" | "too-large";

  constructor(reason: "invalid" | "too-large") {
    super(reason);
    this.reason = reason;
  }
}

async function readJsonBody(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new InvalidRequestBodyError("too-large");
  }

  if (!request.body) {
    throw new InvalidRequestBodyError("invalid");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new InvalidRequestBodyError("too-large");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body)) as unknown;
  } catch {
    throw new InvalidRequestBodyError("invalid");
  }
}

function validationErrors(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
) {
  return Object.fromEntries(
    issues.map(({ path, message }) => [path.join("."), message]),
  );
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json(
      { error: "Send this Christmas wish as JSON." },
      { status: 415 },
    );
  }

  try {
    const limit = await checkGiftRequestRateLimit(request);
    if (!limit.allowed) {
      return Response.json(
        { error: "Too many wishes were sent from this connection. Please try again soon." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfter) },
        },
      );
    }

    const body = await readJsonBody(request);
    if (
      typeof body === "object" &&
      body !== null &&
      "website" in body &&
      typeof body.website === "string" &&
      body.website.trim() !== ""
    ) {
      // Do not reveal honeypot detection to automated submitters.
      return Response.json({ status: "accepted" }, { status: 202 });
    }

    const parsed = giftRequestSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: "Please check the highlighted details and try again.",
          fields: validationErrors(parsed.error.issues),
        },
        { status: 400 },
      );
    }

    const giftRequest = {
      configuration: parsed.data.configuration,
      requester: parsed.data.requester,
      christmasMessage: parsed.data.christmasMessage,
      contactConsent: parsed.data.contactConsent,
    };
    await deliverGiftRequest(giftRequest);

    return Response.json(
      {
        status: "accepted",
        message: "Your Christmas wish was accepted for processing.",
      },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof InvalidRequestBodyError) {
      return Response.json(
        {
          error:
            error.reason === "too-large"
              ? "This Christmas wish is too large to send."
              : "We could not read this Christmas wish.",
        },
        { status: error.reason === "too-large" ? 413 : 400 },
      );
    }

    if (
      error instanceof RateLimitConfigurationError ||
      error instanceof RateLimitUnavailableError ||
      (error instanceof GiftRequestDeliveryError &&
        error.reason === "configuration")
    ) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error.message);
      }
      return Response.json(
        { error: "The Christmas postbox is not configured yet. Please try again later." },
        { status: 503 },
      );
    }

    return Response.json(
      { error: "Your wish could not be sent just now. Your design is still here—please try again." },
      { status: 502 },
    );
  }
}

