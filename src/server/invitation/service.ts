import {isInvitationRecordActive, normaliseInvitationName, type InvitationRecord} from "./model";
import {
  getInvitationRecord,
  saveInvitationRecord,
  type InvitationStoreEnvironment,
} from "./store";
import {generateInvitationToken, hashInvitationToken, isInvitationToken} from "./token";

interface InvitationServiceOptions {
  environment?: InvitationStoreEnvironment;
  fetcher?: typeof fetch;
  now?: Date;
}

export async function createInvitation(
  input: {recipientFirstName: string | null; expiresAt?: Date | null},
  options: InvitationServiceOptions & {generateToken?: () => string} = {},
) {
  const now = options.now ?? new Date();
  const expiresAt = input.expiresAt ?? null;
  if (expiresAt && expiresAt.getTime() <= now.getTime()) {
    throw new Error("Invitation expiration must be in the future");
  }

  const token = (options.generateToken ?? generateInvitationToken)();
  const tokenHash = hashInvitationToken(token);
  const record: InvitationRecord = {
    recipientFirstName: input.recipientFirstName === null ? null : normaliseInvitationName(input.recipientFirstName),
    createdAt: now.toISOString(),
    expiresAt: expiresAt?.toISOString() ?? null,
    revoked: false,
  };
  await saveInvitationRecord(tokenHash, record, options);
  return {token, record};
}

export async function resolveInvitation(
  token: unknown,
  options: InvitationServiceOptions = {},
): Promise<{recipientFirstName: string | null} | null> {
  if (!isInvitationToken(token)) return null;
  try {
    const record = await getInvitationRecord(hashInvitationToken(token), options);
    if (!record || !isInvitationRecordActive(record, options.now)) return null;
    return {recipientFirstName: record.recipientFirstName};
  } catch {
    return null;
  }
}

export async function revokeInvitation(token: unknown, options: InvitationServiceOptions = {}) {
  if (!isInvitationToken(token)) return false;
  const tokenHash = hashInvitationToken(token);
  const record = await getInvitationRecord(tokenHash, options);
  if (!record) return false;
  await saveInvitationRecord(tokenHash, {...record, revoked: true}, options);
  return true;
}
