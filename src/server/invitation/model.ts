import {z} from "zod";

export const MAX_INVITATION_NAME_LENGTH = 50;

const invitationNamePattern = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

export const invitationNameSchema = z
  .string()
  .transform((value) => value.normalize("NFC").trim().replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(1, "Enter the recipient's first name")
      .max(MAX_INVITATION_NAME_LENGTH, `Keep the first name to ${MAX_INVITATION_NAME_LENGTH} characters or fewer`)
      .regex(invitationNamePattern, "Use letters, spaces, apostrophes, or hyphens only"),
  );

export const invitationRecordSchema = z.object({
  recipientFirstName: invitationNameSchema.nullable(),
  createdAt: z.iso.datetime(),
  expiresAt: z.iso.datetime().nullable(),
  revoked: z.boolean(),
});

export type InvitationRecord = z.infer<typeof invitationRecordSchema>;

export function normaliseInvitationName(value: string) {
  return invitationNameSchema.parse(value);
}

export function isInvitationRecordActive(record: InvitationRecord, now = new Date()) {
  return !record.revoked && (record.expiresAt === null || Date.parse(record.expiresAt) > now.getTime());
}
