import {redirect} from "next/navigation";
import type {AppLocale} from "@/i18n/routing";
import {resolveInvitation} from "@/server/invitation/service";
import {ChristmasInvitation} from "./ChristmasInvitation";

export async function ResolvedInvitation({locale, token}: {locale: AppLocale; token: unknown}) {
  const invitation = await resolveInvitation(token);
  if (!invitation) redirect(locale === "en" ? "/en" : "/");

  return <ChristmasInvitation recipientFirstName={invitation.recipientFirstName ?? undefined} />;
}
