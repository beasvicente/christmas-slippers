import { createHmac } from "node:crypto";

const LIMIT = 5;
const WINDOW_SECONDS = 15 * 60;
const localAttempts = new Map<string, { count: number; expiresAt: number }>();

interface RateLimitEnvironment {
  NODE_ENV?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  GIFT_REQUEST_RATE_LIMIT_SECRET?: string;
}

export class RateLimitConfigurationError extends Error {
  constructor() {
    super("Production gift-request rate limiting is not configured");
    this.name = "RateLimitConfigurationError";
  }
}

export class RateLimitUnavailableError extends Error {
  constructor() {
    super("The durable gift-request rate limiter is unavailable");
    this.name = "RateLimitUnavailableError";
  }
}

function requestAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function rateLimitKey(request: Request, secret: string) {
  const fingerprint = createHmac("sha256", secret)
    .update(requestAddress(request))
    .digest("hex");
  return `gift-request:${fingerprint}`;
}

function checkLocalLimit(key: string, now: number) {
  const current = localAttempts.get(key);
  if (!current || current.expiresAt <= now) {
    localAttempts.set(key, {
      count: 1,
      expiresAt: now + WINDOW_SECONDS * 1000,
    });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  return {
    allowed: current.count <= LIMIT,
    retryAfter: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
  };
}

async function checkUpstashLimit(
  key: string,
  url: string,
  token: string,
  fetcher: typeof fetch,
) {
  const response = await fetcher(`${url.replace(/\/$/, "")}/multi-exec`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, WINDOW_SECONDS, "NX"],
      ["TTL", key],
    ]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Durable rate limiter request failed");
  }

  const result = (await response.json()) as Array<{
    result?: number;
    error?: string;
  }>;
  const count = result[0]?.result;
  const ttl = result[2]?.result;
  if (typeof count !== "number" || typeof ttl !== "number") {
    throw new Error("Durable rate limiter returned an invalid response");
  }

  return {
    allowed: count <= LIMIT,
    retryAfter: Math.max(1, ttl),
  };
}

export async function checkGiftRequestRateLimit(
  request: Request,
  options: {
    environment?: RateLimitEnvironment;
    fetcher?: typeof fetch;
    now?: number;
  } = {},
) {
  const environment = options.environment ?? process.env;
  const secret = environment.GIFT_REQUEST_RATE_LIMIT_SECRET?.trim();
  const url = environment.UPSTASH_REDIS_REST_URL?.trim();
  const token = environment.UPSTASH_REDIS_REST_TOKEN?.trim();
  const isProduction = environment.NODE_ENV === "production";

  if (isProduction && (!secret || !url || !token)) {
    throw new RateLimitConfigurationError();
  }

  const key = rateLimitKey(request, secret || "local-development-only");
  if (url && token) {
    try {
      return await checkUpstashLimit(key, url, token, options.fetcher ?? fetch);
    } catch {
      throw new RateLimitUnavailableError();
    }
  }

  // Development/test convenience only. Production deliberately fails closed
  // above because per-process memory is not a global serverless rate limit.
  return checkLocalLimit(key, options.now ?? Date.now());
}

