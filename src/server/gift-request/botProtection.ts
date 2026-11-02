const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const EXPECTED_ACTION = "gift-request";
const VERIFY_TIMEOUT_MS = 5_000;

interface BotProtectionEnvironment {
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_ALLOWED_HOSTNAMES?: string;
}

interface SiteverifyResponse {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export class BotProtectionConfigurationError extends Error {
  constructor() {
    super("Turnstile verification is not configured");
    this.name = "BotProtectionConfigurationError";
  }
}

export class BotProtectionUnavailableError extends Error {
  constructor() {
    super("Turnstile verification is unavailable");
    this.name = "BotProtectionUnavailableError";
  }
}

export async function verifyGiftRequestChallenge(
  request: Request,
  token: string,
  options: {
    environment?: BotProtectionEnvironment;
    fetcher?: typeof fetch;
  } = {},
) {
  const secret = (options.environment ?? process.env).TURNSTILE_SECRET_KEY?.trim();
  if (!secret) throw new BotProtectionConfigurationError();

  // Siteverify's optional remoteip is omitted: forwarded client headers must
  // not be trusted outside a verified hosting-proxy boundary.
  if (!token || token.length > 2048) return false;
  const allowed = (options.environment ?? process.env).TURNSTILE_ALLOWED_HOSTNAMES
    ?.split(",").map((hostname) => hostname.trim()).filter(Boolean) ?? [];
  if (allowed.length === 0) throw new BotProtectionConfigurationError();
  const body = new URLSearchParams({secret, response: token});

  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(SITEVERIFY_URL, {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
  } catch {
    throw new BotProtectionUnavailableError();
  }

  if (!response.ok) throw new BotProtectionUnavailableError();

  let result: SiteverifyResponse;
  try {
    result = (await response.json()) as SiteverifyResponse;
  } catch {
    throw new BotProtectionUnavailableError();
  }

  return result.success === true && result.action === EXPECTED_ACTION &&
    typeof result.hostname === "string" && allowed.includes(result.hostname);
}
