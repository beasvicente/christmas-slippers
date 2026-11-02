
import {
  isInvitationRecordActive,
  normaliseInvitationName,
  type InvitationRecord,
} from "./model";

import {
  deleteInvitationRecord,
  getInvitationRecord,
  saveInvitationRecord,
  type InvitationStoreEnvironment,
} from "./store";

import {
  generateInvitationToken,
  hashInvitationToken,
  isInvitationToken,
} from "./token";

// Default invitation lifetime: 30 days.
const DEFAULT_INVITATION_LIFETIME_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

interface InvitationServiceOptions {
  environment?: InvitationStoreEnvironment;
  fetcher?: typeof fetch;
  now?: Date;
}

/**
 * Creates a personalised or generic Christmas invitation.
 *
 * - Personalised invitations contain the recipient's first name.
 * - Generic invitations use recipientFirstName: null.
 * - Invitations expire after 30 days by default.
 * - An explicit expiration date overrides the default.
 * - Only the hashed invitation token is stored.
 */
export async function createInvitation(
  input: {
    recipientFirstName: string | null;
    expiresAt?: Date | null;
  },
  options: InvitationServiceOptions & {
    generateToken?: () => string;
  } = {},
) {
  const now = options.now ?? new Date();

  // Apply a default expiration when none is provided.
  const expiresAt =
    input.expiresAt ??
    new Date(
      now.getTime() +
        DEFAULT_INVITATION_LIFETIME_DAYS *
          MILLISECONDS_PER_DAY,
    );

  // Reject invalid or past expiration dates.
  if (
    !Number.isFinite(expiresAt.getTime()) ||
    expiresAt.getTime() <= now.getTime()
  ) {
    throw new Error(
      "Invitation expiration must be a valid future date",
    );
  }

  // Generate a secure invitation token.
  const token = (
    options.generateToken ??
    generateInvitationToken
  )();

  const tokenHash = hashInvitationToken(token);

  // Store only the necessary invitation information.
  const record: InvitationRecord = {
    recipientFirstName:
      input.recipientFirstName === null
        ? null
        : normaliseInvitationName(
            input.recipientFirstName,
          ),

    createdAt: now.toISOString(),

    expiresAt: expiresAt.toISOString(),

    revoked: false,
  };

  await saveInvitationRecord(
    tokenHash,
    record,
    options,
  );

  return {
    token,
    record,
  };
}

/**
 * Resolves a private Christmas invitation.
 *
 * Returns only the recipient's first name.
 *
 * Invalid, expired, revoked or unavailable invitations
 * return null without exposing storage details.
 */
export async function resolveInvitation(
  token: unknown,
  options: InvitationServiceOptions = {},
): Promise<{
  recipientFirstName: string | null;
} | null> {
  if (!isInvitationToken(token)) {
    return null;
  }

  try {
    const tokenHash = hashInvitationToken(token);

    const record = await getInvitationRecord(
      tokenHash,
      options,
    );

    if (
      !record ||
      !isInvitationRecordActive(
        record,
        options.now,
      )
    ) {
      return null;
    }

    return {
      recipientFirstName: record.recipientFirstName,
    };
  } catch {
    // Fail closed if invitation storage is unavailable.
    return null;
  }
}


/**
 * Permanently revokes an invitation.
 *
 * Removes the stored record and its index entry,
 * including any recipient information.
 */
export async function revokeInvitation(
  token: unknown,
  options: InvitationServiceOptions = {},
): Promise<boolean> {
  if (!isInvitationToken(token)) {
    return false;
  }

  const tokenHash = hashInvitationToken(token);

  return deleteInvitationRecord(tokenHash, options);
}

