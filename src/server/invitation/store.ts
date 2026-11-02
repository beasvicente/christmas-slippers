
import {
  invitationRecordSchema,
  type InvitationRecord,
} from "./model";

const RECORD_PREFIX =
  "christmas-slippers:invitation:v1:record:";

const RECORD_INDEX =
  "christmas-slippers:invitation:v1:index";

const REDIS_TIMEOUT_MS = 5_000;

export interface InvitationStoreEnvironment {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}

type RedisCommand = readonly [string, ...string[]];

type UpstashResult = {
  result?: unknown;
  error?: string;
};

interface InvitationStoreOptions {
  environment?: InvitationStoreEnvironment;
  fetcher?: typeof fetch;
  now?: Date;
}

export class InvitationStoreConfigurationError extends Error {
  constructor() {
    super("Invitation storage is not configured");
    this.name = "InvitationStoreConfigurationError";
  }
}

export class InvitationStoreUnavailableError extends Error {
  constructor() {
    super("Invitation storage is unavailable");
    this.name = "InvitationStoreUnavailableError";
  }
}

function getConfiguration(
  environment: InvitationStoreEnvironment,
) {
  const url = environment.UPSTASH_REDIS_REST_URL
    ?.trim()
    .replace(/\/$/, "");

  const token =
    environment.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token || !url.startsWith("https://")) {
    throw new InvitationStoreConfigurationError();
  }

  return {url, token};
}

function defaultEnvironment(): InvitationStoreEnvironment {
  return {
    UPSTASH_REDIS_REST_URL:
      process.env.UPSTASH_REDIS_REST_URL,

    UPSTASH_REDIS_REST_TOKEN:
      process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}

/**
 * Executes Redis commands through Upstash.
 *
 * Never exposes Redis credentials or raw provider errors
 * to application callers.
 */
async function execute(
  commands: readonly RedisCommand[],
  environment: InvitationStoreEnvironment,
  fetcher: typeof fetch,
): Promise<unknown[]> {
  const {url, token} = getConfiguration(environment);

  let response: Response;

  try {
    response = await fetcher(`${url}/multi-exec`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
      signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
    });
  } catch {
    throw new InvitationStoreUnavailableError();
  }

  if (!response.ok) {
    throw new InvitationStoreUnavailableError();
  }

  let results: UpstashResult[];

  try {
    results = (await response.json()) as UpstashResult[];
  } catch {
    throw new InvitationStoreUnavailableError();
  }

  if (
    !Array.isArray(results) ||
    results.length !== commands.length ||
    results.some(
      (item) =>
        !item ||
        typeof item !== "object" ||
        item.error !== undefined,
    )
  ) {
    throw new InvitationStoreUnavailableError();
  }

  return results.map((item) => item.result);
}

function recordKey(tokenHash: string): string {
  return `${RECORD_PREFIX}${tokenHash}`;
}

function parseRecord(value: unknown): InvitationRecord | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const result = invitationRecordSchema.safeParse(
      JSON.parse(value),
    );

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/**
 * Saves an invitation record with Redis expiration.
 *
 * EXAT sets an absolute Unix expiration timestamp.
 * Redis automatically removes the record after expiry.
 *
 * The separate index contains only token hashes.
 */
export async function saveInvitationRecord(
  tokenHash: string,
  record: InvitationRecord,
  options: InvitationStoreOptions = {},
): Promise<void> {
  const validated = invitationRecordSchema.parse(record);

  if (validated.expiresAt === null) {
    throw new Error(
      "Invitation records must have an expiration date",
    );
  }

  const expirationMs = Date.parse(validated.expiresAt);

  if (
    !Number.isFinite(expirationMs) ||
    expirationMs <= (options.now ?? new Date()).getTime()
  ) {
    throw new Error(
      "Invitation expiration must be in the future",
    );
  }

  const expirationSeconds = Math.ceil(
    expirationMs / 1000,
  );

  const environment =
    options.environment ?? defaultEnvironment();

  const fetcher = options.fetcher ?? fetch;

  await execute(
    [
      [
        "SET",
        recordKey(tokenHash),
        JSON.stringify(validated),
        "EXAT",
        String(expirationSeconds),
      ],
      [
        "SADD",
        RECORD_INDEX,
        tokenHash,
      ],
    ],
    environment,
    fetcher,
  );
}

/**
 * Retrieves and validates an invitation record.
 *
 * Once Redis expiration has occurred, GET returns null.
 */
export async function getInvitationRecord(
  tokenHash: string,
  options: InvitationStoreOptions = {},
): Promise<InvitationRecord | null> {
  const [value] = await execute(
    [
      ["GET", recordKey(tokenHash)],
    ],
    options.environment ?? defaultEnvironment(),
    options.fetcher ?? fetch,
  );

  return parseRecord(value);
}

/**
 * Permanently deletes an invitation.
 *
 * Removes both:
 * - the stored invitation record
 * - its token hash from the listing index
 *
 * Returns true when the record existed.
 */
export async function deleteInvitationRecord(
  tokenHash: string,
  options: InvitationStoreOptions = {},
): Promise<boolean> {
  const [deleted] = await execute(
    [
      ["DEL", recordKey(tokenHash)],
      ["SREM", RECORD_INDEX, tokenHash],
    ],
    options.environment ?? defaultEnvironment(),
    options.fetcher ?? fetch,
  );

  if (typeof deleted !== "number") {
    throw new InvitationStoreUnavailableError();
  }

  return deleted > 0;
}

/**
 * Lists invitation records.
 *
 * Expired Redis records can leave stale hashes in the
 * listing index. These are removed during listing.
 */
export async function listInvitationRecords(
  options: InvitationStoreOptions = {},
) {
  const environment =
    options.environment ?? defaultEnvironment();

  const fetcher = options.fetcher ?? fetch;

  const [members] = await execute(
    [
      ["SMEMBERS", RECORD_INDEX],
    ],
    environment,
    fetcher,
  );

  if (
    !Array.isArray(members) ||
    members.some((value) => typeof value !== "string")
  ) {
    throw new InvitationStoreUnavailableError();
  }

  const hashes = members as string[];

  if (hashes.length === 0) {
    return [];
  }

  const [values] = await execute(
    [
      ["MGET", ...hashes.map(recordKey)],
    ],
    environment,
    fetcher,
  );

  if (
    !Array.isArray(values) ||
    values.length !== hashes.length
  ) {
    throw new InvitationStoreUnavailableError();
  }

  const invitations: {
    id: string;
    tokenHash: string;
    record: InvitationRecord;
  }[] = [];

  const staleHashes: string[] = [];

  const now = Date.now();

  for (let index = 0; index < hashes.length; index++) {
    const tokenHash = hashes[index];
    const record = parseRecord(values[index]);

    if (
      !record ||
      record.revoked ||
      (
        record.expiresAt !== null &&
        Date.parse(record.expiresAt) <= now
      )
    ) {
      staleHashes.push(tokenHash);
      continue;
    }

    invitations.push({
      id: tokenHash.slice(0, 12),
      tokenHash,
      record,
    });
  }

  // Remove index entries whose records are absent,
  // invalid, expired or revoked.
  if (staleHashes.length > 0) {
    await execute(
      [
        ["SREM", RECORD_INDEX, ...staleHashes],
      ],
      environment,
      fetcher,
    );
  }

  return invitations.sort((a, b) =>
    b.record.createdAt.localeCompare(a.record.createdAt),
  );
}
