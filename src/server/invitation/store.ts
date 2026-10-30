import {invitationRecordSchema, type InvitationRecord} from "./model";

const RECORD_PREFIX = "christmas-slippers:invitation:v1:record:";
const RECORD_INDEX = "christmas-slippers:invitation:v1:index";

export interface InvitationStoreEnvironment {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}

type RedisCommand = readonly [string, ...string[]];
type UpstashResult = {result?: unknown; error?: string};

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

function getConfiguration(environment: InvitationStoreEnvironment) {
  const url = environment.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, "");
  const token = environment.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) throw new InvitationStoreConfigurationError();
  return {url, token};
}

function defaultEnvironment(): InvitationStoreEnvironment {
  return {
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}

async function execute(
  commands: readonly RedisCommand[],
  environment: InvitationStoreEnvironment,
  fetcher: typeof fetch,
) {
  const {url, token} = getConfiguration(environment);
  let response: Response;
  try {
    response = await fetcher(`${url}/multi-exec`, {
      method: "POST",
      headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
      body: JSON.stringify(commands),
      cache: "no-store",
    });
  } catch {
    throw new InvitationStoreUnavailableError();
  }

  if (!response.ok) throw new InvitationStoreUnavailableError();

  let results: UpstashResult[];
  try {
    results = (await response.json()) as UpstashResult[];
  } catch {
    throw new InvitationStoreUnavailableError();
  }
  if (!Array.isArray(results) || results.length !== commands.length || results.some((item) => item.error)) {
    throw new InvitationStoreUnavailableError();
  }
  return results.map((item) => item.result);
}

function recordKey(tokenHash: string) {
  return `${RECORD_PREFIX}${tokenHash}`;
}

function parseRecord(value: unknown): InvitationRecord | null {
  if (typeof value !== "string") return null;
  try {
    const result = invitationRecordSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function saveInvitationRecord(
  tokenHash: string,
  record: InvitationRecord,
  options: {environment?: InvitationStoreEnvironment; fetcher?: typeof fetch} = {},
) {
  const value = JSON.stringify(invitationRecordSchema.parse(record));
  await execute(
    [["SET", recordKey(tokenHash), value], ["SADD", RECORD_INDEX, tokenHash]],
    options.environment ?? defaultEnvironment(),
    options.fetcher ?? fetch,
  );
}

export async function getInvitationRecord(
  tokenHash: string,
  options: {environment?: InvitationStoreEnvironment; fetcher?: typeof fetch} = {},
) {
  const [value] = await execute(
    [["GET", recordKey(tokenHash)]],
    options.environment ?? defaultEnvironment(),
    options.fetcher ?? fetch,
  );
  return parseRecord(value);
}

export async function listInvitationRecords(
  options: {environment?: InvitationStoreEnvironment; fetcher?: typeof fetch} = {},
) {
  const environment = options.environment ?? defaultEnvironment();
  const fetcher = options.fetcher ?? fetch;
  const [members] = await execute([["SMEMBERS", RECORD_INDEX]], environment, fetcher);
  if (!Array.isArray(members) || members.some((value) => typeof value !== "string")) return [];
  const hashes = members as string[];
  if (hashes.length === 0) return [];
  const [values] = await execute([["MGET", ...hashes.map(recordKey)]], environment, fetcher);
  if (!Array.isArray(values)) throw new InvitationStoreUnavailableError();

  return hashes.flatMap((tokenHash, index) => {
    const record = parseRecord(values[index]);
    return record ? [{id: tokenHash.slice(0, 12), tokenHash, record}] : [];
  }).sort((a, b) => b.record.createdAt.localeCompare(a.record.createdAt));
}
