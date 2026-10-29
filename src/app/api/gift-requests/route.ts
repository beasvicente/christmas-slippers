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
import {apiMessage, localeFromRequest, validationMessage} from "../../../i18n/apiErrors";
import type {AppLocale} from "../../../i18n/routing";

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
  locale: AppLocale,
) {
  return Object.fromEntries(
    issues.map(({ path }) => [path.join("."), validationMessage(locale, path)]),
  );
}

export async function POST(request: Request) {
  const locale = localeFromRequest(request);
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json(
      {code: "mediaType", error: apiMessage(locale, "mediaType")},
      { status: 415 },
    );
  }

  try {
    const limit = await checkGiftRequestRateLimit(request);
    if (!limit.allowed) {
      return Response.json(
        {code: "rateLimited", error: apiMessage(locale, "rateLimited")},
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
          code: "validation",
          error: apiMessage(locale, "validation"),
          fields: validationErrors(parsed.error.issues, locale),
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
        message: apiMessage(locale, "accepted"),
      },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof InvalidRequestBodyError) {
      return Response.json(
        {
          code: error.reason === "too-large" ? "tooLarge" : "unreadable",
          error: apiMessage(locale, error.reason === "too-large" ? "tooLarge" : "unreadable"),
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
        {code: "unavailable", error: apiMessage(locale, "unavailable")},
        { status: 503 },
      );
    }

    return Response.json(
      {code: "delivery", error: apiMessage(locale, "delivery")},
      { status: 502 },
    );
  }
}

