import {existsSync} from "node:fs";
import process from "node:process";
import {createInvitation, revokeInvitation} from "../src/server/invitation/service";
import {listInvitationRecords} from "../src/server/invitation/store";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

function option(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requireOption(name: string) {
  const value = option(name)?.trim();
  if (!value) throw new Error(`Missing required --${name} option`);
  return value;
}

function publicBaseUrl() {
  const configured = process.env.INVITATION_PUBLIC_BASE_URL?.trim();
  if (!configured) throw new Error("INVITATION_PUBLIC_BASE_URL is not configured");
  const url = new URL(configured);
  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !localHttp) {
    throw new Error("INVITATION_PUBLIC_BASE_URL must use HTTPS (HTTP is allowed only for local development)");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("INVITATION_PUBLIC_BASE_URL must not include credentials, a query, or a fragment");
  }
  return url;
}

function invitationUrl(base: URL, token: string, locale: "pt-PT" | "en") {
  return new URL(locale === "en" ? `/en/invite/${token}` : `/invite/${token}`, base).toString();
}

function parseExpiration(value: string | undefined) {
  if (!value) return null;
  const expiration = new Date(value);
  if (Number.isNaN(expiration.getTime())) throw new Error("--expires must be a valid ISO date or date-time");
  return expiration;
}

async function create() {
  const base = publicBaseUrl();
  const {token, record} = await createInvitation({
    recipientFirstName: requireOption("name"),
    expiresAt: parseExpiration(option("expires")),
  });
  console.log(`Invitation created for ${record.recipientFirstName}.`);
  console.log(`PT: ${invitationUrl(base, token, "pt-PT")}`);
  console.log(`EN: ${invitationUrl(base, token, "en")}`);
  console.log("Keep these bearer links private. Anyone who has one can view the personalised invitation.");
}

async function createGeneric() {
  const base = publicBaseUrl();
  const {token} = await createInvitation({
    recipientFirstName: null,
    expiresAt: parseExpiration(option("expires")),
  });
  console.log("Generic invitation created.");
  console.log(`PT: ${invitationUrl(base, token, "pt-PT")}`);
  console.log(`EN: ${invitationUrl(base, token, "en")}`);
  console.log("Keep these bearer links private. Anyone who has one can view the invitation.");
}

async function list() {
  const records = await listInvitationRecords();
  if (records.length === 0) {
    console.log("No invitation records found.");
    return;
  }
  console.table(records.map(({id, record}) => ({
    id,
    recipient: record.recipientFirstName ?? "Generic invitation",
    created: record.createdAt,
    expires: record.expiresAt ?? "never",
    revoked: record.revoked,
  })));
}

async function revoke() {
  const revoked = await revokeInvitation(requireOption("token"));
  if (!revoked) throw new Error("Invitation not found or token is malformed");
  console.log("Invitation revoked.");
}

async function main() {
  const command = process.argv[2];
  if (command === "create") return create();
  if (command === "create-generic") return createGeneric();
  if (command === "list") return list();
  if (command === "revoke") return revoke();
  throw new Error("Use one of: create, create-generic, list, revoke");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown invitation command error";
  console.error(`Invitation command failed: ${message}`);
  process.exitCode = 1;
});
