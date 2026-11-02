const DEFAULT_DAILY_QUOTA = 25;
const MIN_DAILY_QUOTA = 1;
const MAX_DAILY_QUOTA = 1_000;
const QUOTA_KEY_PREFIX = "gift-request:daily:v1:";

const RELEASE_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
if current > 0 then redis.call("DECR", KEYS[1]) end
return 1
`;

const RESERVE_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
local limit = tonumber(ARGV[1])
if current >= limit then
  return {0, current, redis.call("TTL", KEYS[1])}
end
local next = redis.call("INCR", KEYS[1])
if next == 1 then
  redis.call("EXPIREAT", KEYS[1], ARGV[2])
end
return {1, next, redis.call("TTL", KEYS[1])}
`;

interface DailyQuotaEnvironment {
  NODE_ENV?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  GIFT_REQUEST_DAILY_QUOTA?: string;
}

const localReservations = new Map<string, number>();

export class DailyQuotaConfigurationError extends Error {
  constructor() {
    super("Production gift-request daily quota is not configured");
    this.name = "DailyQuotaConfigurationError";
  }
}

export class DailyQuotaUnavailableError extends Error {
  constructor() {
    super("The gift-request daily quota is unavailable");
    this.name = "DailyQuotaUnavailableError";
  }
}

function parseQuota(value: string | undefined) {
  if (!value?.trim()) return DEFAULT_DAILY_QUOTA;
  const quota = Number(value);
  if (!Number.isInteger(quota) || quota < MIN_DAILY_QUOTA || quota > MAX_DAILY_QUOTA) {
    throw new DailyQuotaConfigurationError();
  }
  return quota;
}

function utcQuotaWindow(now: Date) {
  const day = now.toISOString().slice(0, 10);
  const tomorrow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  return {
    key: `${QUOTA_KEY_PREFIX}${day}`,
    expiresAtSeconds: Math.floor(tomorrow / 1000),
    retryAfter: Math.max(1, Math.ceil((tomorrow - now.getTime()) / 1000)),
  };
}

function reserveLocal(key: string, limit: number, retryAfter: number) {
  const current = localReservations.get(key) ?? 0;
  if (current >= limit) return {allowed: false, retryAfter, reservationKey: undefined};
  localReservations.set(key, current + 1);
  return {allowed: true, retryAfter: 0, reservationKey: key};
}

export async function reserveDailyGiftRequestQuota(
  options: {
    environment?: DailyQuotaEnvironment;
    fetcher?: typeof fetch;
    now?: Date;
  } = {},
) {
  const environment = options.environment ?? process.env;
  const limit = parseQuota(environment.GIFT_REQUEST_DAILY_QUOTA);
  const url = environment.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, "");
  const token = environment.UPSTASH_REDIS_REST_TOKEN?.trim();
  const window = utcQuotaWindow(options.now ?? new Date());

  if (url && environment.NODE_ENV === "production" && !url.startsWith("https://")) throw new DailyQuotaConfigurationError();

  if (!url || !token) {
    if (environment.NODE_ENV === "production") {
      throw new DailyQuotaConfigurationError();
    }
    return reserveLocal(window.key, limit, window.retryAfter);
  }

  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", RESERVE_SCRIPT, "1", window.key,
        String(limit), String(window.expiresAtSeconds)]),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new DailyQuotaUnavailableError();
  }

  if (!response.ok) throw new DailyQuotaUnavailableError();

  let payload: {result?: unknown; error?: string};
  try {
    payload = (await response.json()) as {result?: unknown; error?: string};
  } catch {
    throw new DailyQuotaUnavailableError();
  }

  const result = payload.result;
  if (
    payload.error ||
    !Array.isArray(result) ||
    (result[0] !== 0 && result[0] !== 1)
  ) {
    throw new DailyQuotaUnavailableError();
  }

  return {
    allowed: result[0] === 1,
    retryAfter: result[0] === 1
      ? 0
      : typeof result[2] === "number" && result[2] > 0
        ? result[2]
        : window.retryAfter,
    reservationKey: result[0] === 1 ? window.key : undefined,
  };
}

/** Release a quota slot only after a delivery has DEFINITIVELY failed.
 * If the provider's outcome is unknown (network timeout), do not release:
 * the provider might already have accepted the email. */
export async function releaseDailyGiftRequestQuota(
  reservationKey: string,
  options: {environment?: DailyQuotaEnvironment; fetcher?: typeof fetch} = {},
): Promise<void> {
  if (!reservationKey.startsWith(QUOTA_KEY_PREFIX)) throw new DailyQuotaConfigurationError();
  const environment = options.environment ?? process.env;
  const url = environment.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, "");
  const token = environment.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    if (environment.NODE_ENV === "production") throw new DailyQuotaConfigurationError();
    localReservations.set(reservationKey, Math.max(0, (localReservations.get(reservationKey) ?? 0) - 1));
    return;
  }
  if (environment.NODE_ENV === "production" && !url.startsWith("https://")) throw new DailyQuotaConfigurationError();
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(url, {
      method: "POST",
      headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      body: JSON.stringify(["EVAL", RELEASE_SCRIPT, "1", reservationKey]),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch { throw new DailyQuotaUnavailableError(); }
  if (!response.ok) throw new DailyQuotaUnavailableError();
  const result = (await response.json().catch(() => null)) as {result?: unknown; error?: string} | null;
  if (result?.error || result?.result !== 1) throw new DailyQuotaUnavailableError();
}
