import {createHash, randomBytes} from "node:crypto";

export const INVITATION_TOKEN_BYTES = 32;
const TOKEN_LENGTH = 43;
const tokenPattern = new RegExp(`^[A-Za-z0-9_-]{${TOKEN_LENGTH}}$`);

export function generateInvitationToken(random: (size: number) => Buffer = randomBytes) {
  return random(INVITATION_TOKEN_BYTES).toString("base64url");
}

export function isInvitationToken(value: unknown): value is string {
  return typeof value === "string" && tokenPattern.test(value);
}

export function hashInvitationToken(token: string) {
  if (!isInvitationToken(token)) throw new Error("Invalid invitation token");
  return createHash("sha256").update(token, "utf8").digest("hex");
}
