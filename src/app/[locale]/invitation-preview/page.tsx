import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {Suspense} from "react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {ResolvedInvitation} from "@/components/invitation/ResolvedInvitation";
import {isAppLocale} from "@/i18n/routing";

export async function generateMetadata({params}: PageProps<"/[locale]/invitation-preview">): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({locale, namespace: "Invitation"});
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    robots: {index: false, follow: false},
  };
}

async function PreviewInvitation({locale, searchParams}: {locale: "pt-PT" | "en"; searchParams: PageProps<"/[locale]/invitation-preview">["searchParams"]}) {
  const query = await searchParams;
  return <ResolvedInvitation locale={locale} token={query.invite} />;
}

export default async function InvitationPreviewPage({params, searchParams}: PageProps<"/[locale]/invitation-preview">) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <PreviewInvitation locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}
