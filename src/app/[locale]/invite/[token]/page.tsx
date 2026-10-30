import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {Suspense} from "react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {ResolvedInvitation} from "@/components/invitation/ResolvedInvitation";
import {isAppLocale} from "@/i18n/routing";

type InvitePageProps = {
  params: Promise<{locale: string; token: string}>;
};

export async function generateMetadata({params}: InvitePageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({locale, namespace: "Invitation"});
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    robots: {index: false, follow: false},
  };
}

async function TokenInvitation({params}: InvitePageProps) {
  const {locale, token} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  return <ResolvedInvitation locale={locale} token={token} />;
}

export default function InvitePage({params}: InvitePageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <TokenInvitation params={params} />
    </Suspense>
  );
}
