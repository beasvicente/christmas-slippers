
import {giftRequestSubmissionSchema} from "../../domain/gift-request/index";
import {apiMessage, localeFromRequest, validationMessage} from "../../i18n/apiErrors";
import type {AppLocale} from "../../i18n/routing";

import {
  BotProtectionConfigurationError,
  BotProtectionUnavailableError,
  verifyGiftRequestChallenge,
} from "./botProtection";

import {
  DailyQuotaConfigurationError,
  DailyQuotaUnavailableError,
  reserveDailyGiftRequestQuota,
  releaseDailyGiftRequestQuota,
} from "./dailyQuota";

import {
  deliverGiftRequest,
  GiftRequestDeliveryError,
} from "./delivery";

import {
  checkGiftRequestRateLimit,
  RateLimitConfigurationError,
  RateLimitUnavailableError,
} from "./rateLimit";

const MAX_BODY_BYTES = 16 * 1024;

class InvalidRequestBodyError extends Error {
  readonly reason: "invalid" | "too-large";

  constructor(reason: "invalid" | "too-large") {
    super(reason);
    this.name = "InvalidRequestBodyError";
    this.reason = reason;
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  const lengthHeader = request.headers.get("content-length");

  if (lengthHeader !== null) {
    const declaredLength = Number(lengthHeader);

    if (
      !Number.isFinite(declaredLength) ||
      declaredLength < 0 ||
      declaredLength > MAX_BODY_BYTES
    ) {
      throw new InvalidRequestBodyError(
        declaredLength > MAX_BODY_BYTES ? "too-large" : "invalid",
      );
    }
  }

  if (!request.body) {
    throw new InvalidRequestBodyError("invalid");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const {done, value} = await reader.read();

    if (done) break;

    received += value.byteLength;

    if (received > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new InvalidRequestBodyError("too-large");
    }

    chunks.push(value);
  }

  const buffer = new Uint8Array(received);
  let offset = 0;

  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(buffer)) as unknown;
  } catch {
    throw new InvalidRequestBodyError("invalid");
  }
}

function validationErrors(
  issues: ReadonlyArray<{path: PropertyKey[]}>,
  locale: AppLocale,
) {
  return Object.fromEntries(
    issues.map(({path}) => [
      path.join("."),
      validationMessage(locale, path),
    ]),
  );
}

/**
 * Separates the Turnstile token from the gift-request domain payload.
 *
 * The token is transport-only and must not become part of
 * the persisted or emailed gift-request data.
 */


interface GiftRequestRouteDependencies {
  environment?: NodeJS.ProcessEnv;
  checkRateLimit?: typeof checkGiftRequestRateLimit;
  verifyChallenge?: typeof verifyGiftRequestChallenge;
  reserveQuota?: typeof reserveDailyGiftRequestQuota;
  releaseQuota?: typeof releaseDailyGiftRequestQuota;
  deliver?: typeof deliverGiftRequest;
}

export function createGiftRequestPostHandler(
  dependencies: GiftRequestRouteDependencies = {},
) {
  return async function postGiftRequest(request: Request) {
    const locale = localeFromRequest(request);
    const environment = dependencies.environment ?? process.env;

    // 1. Validate the request content type.
    const contentType = request.headers.get("content-type");

    if (
      !contentType ||
      !/^application\/json(?:\s*;|$)/i.test(contentType)
    ) {
      return Response.json(
        {
          code: "mediaType",
          error: apiMessage(locale, "mediaType"),
        },
        {status: 415},
      );
    }

    // 2. Server-side delivery kill switch.
    // Only the explicit value "true" enables delivery.
    if (environment.GIFT_REQUEST_DELIVERY_ENABLED !== "true") {
      return Response.json(
        {
          code: "deliveryDisabled",
          error: apiMessage(locale, "deliveryDisabled"),
        },
        {status: 503},
      );
    }

    try {
      // 3. Apply the existing per-IP rate limit.
      const limit = await (
        dependencies.checkRateLimit
          ? dependencies.checkRateLimit(request)
          : checkGiftRequestRateLimit(request, {environment})
      );

      if (!limit.allowed) {
        return Response.json(
          {
            code: "rateLimited",
            error: apiMessage(locale, "rateLimited"),
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(limit.retryAfter),
            },
          },
        );
      }

      // 4. Read and bound the request body.
      const body = await readJsonBody(request);

      // Existing honeypot behaviour.
      if (
        typeof body === "object" &&
        body !== null &&
        "website" in body &&
        typeof body.website === "string" &&
        body.website.trim() !== ""
      ) {
        return Response.json(
          {status: "accepted"},
          {status: 202},
        );
      }

      // 5. Extract the transport-only Turnstile token.
      //const {payload, challengeToken} =
        //extractSubmissionPayload(body);

      // 6. Validate the actual gift-request data.
      //const parsed = giftRequestSubmissionSchema.safeParse(payload);
      const parsed = giftRequestSubmissionSchema.safeParse(body);

      if (!parsed.success) {
        return Response.json(
          {
            code: "validation",
            error: apiMessage(locale, "validation"),
            fields: validationErrors(
              parsed.error.issues,
              locale,
            ),
          },
          {status: 400},
        );
      }

      // 7. Verify Turnstile on the server.
      const challengeIsValid = await (
        dependencies.verifyChallenge
          ? dependencies.verifyChallenge(request, parsed.data.turnstileToken)
          : verifyGiftRequestChallenge(
              request,
              parsed.data.turnstileToken,
              {
                environment: {
                  TURNSTILE_SECRET_KEY:
                    environment.TURNSTILE_SECRET_KEY,
                  TURNSTILE_ALLOWED_HOSTNAMES:
                    environment.TURNSTILE_ALLOWED_HOSTNAMES,
                },
              },
            )
      );

      if (!challengeIsValid) {
        return Response.json(
          {
            code: "botChallenge",
            error: apiMessage(locale, "botChallenge"),
          },
          {status: 403},
        );
      }

      // 8. Reserve an atomic global daily quota slot.
      const quota = await (
        dependencies.reserveQuota
          ? dependencies.reserveQuota()
          : reserveDailyGiftRequestQuota({environment})
      );

      if (!quota.allowed) {
        return Response.json(
          {
            code: "dailyQuota",
            error: apiMessage(locale, "dailyQuota"),
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(quota.retryAfter),
            },
          },
        );
      }

      // 9. Build the validated email payload.
      
      // Build the validated email payload.
      // The Turnstile token is intentionally excluded.
      const giftRequest = {
        configuration: parsed.data.configuration,
        requester: parsed.data.requester,
        christmasMessage: parsed.data.christmasMessage,
        contactConsent: parsed.data.contactConsent,
      };


      // 10. Attempt delivery.
      
      try {
        await (
          dependencies.deliver ?? deliverGiftRequest
        )(giftRequest);
      } catch (deliveryError) {
        // Release the quota only when delivery definitely did
        // not happen (for example, missing provider configuration).
        //
        // A network timeout can be ambiguous: the provider may
        // have accepted the request before the connection failed.
        // Keep the quota reservation in those situations.
        if (
          deliveryError instanceof GiftRequestDeliveryError &&
          deliveryError.reason === "configuration" &&
          quota.reservationKey
        ) {
          try {
            await (
              dependencies.releaseQuota ??
              releaseDailyGiftRequestQuota
            )(
              quota.reservationKey,
              {environment},
            );
          } catch {
            // Rollback failure must not hide the original error.
          }
        }

        throw deliveryError;
      }

      // 11. Return a successful response only after delivery.
      return Response.json(
        {
          status: "accepted",
          message: apiMessage(locale, "accepted"),
        },
        {status: 202},
      );
    //} catch (error) {
      // Invalid or oversized request bodies.
      //if (error instanceof InvalidRequestBodyError) {
      } catch (error) {
        

        if (error instanceof InvalidRequestBodyError) {
        const code =
          error.reason === "too-large"
            ? "tooLarge"
            : "unreadable";

        return Response.json(
          {
            code,
            error: apiMessage(locale, code),
          },
          {
            status:
              error.reason === "too-large" ? 413 : 400,
          },
        );
      }

      // Service configuration or availability failures.
      if (
        error instanceof RateLimitConfigurationError ||
        error instanceof RateLimitUnavailableError ||
        error instanceof BotProtectionConfigurationError ||
        error instanceof BotProtectionUnavailableError ||
        error instanceof DailyQuotaConfigurationError ||
        error instanceof DailyQuotaUnavailableError ||
        (
          error instanceof GiftRequestDeliveryError &&
          error.reason === "configuration"
        )
      ) {
        if (environment.NODE_ENV !== "production") {
          console.error(error.message);
        }

        return Response.json(
          {
            code: "unavailable",
            error: apiMessage(locale, "unavailable"),
          },
          {status: 503},
        );
      }

      // Generic delivery failure without exposing server details.
      return Response.json(
        {
          code: "delivery",
          error: apiMessage(locale, "delivery"),
        },
        {status: 502},
      );
    }
  };
}
