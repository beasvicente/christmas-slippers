import { Footer } from "@/components/landing/Footer";
import { HandmadeStory } from "@/components/landing/HandmadeStory";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {isAppLocale} from "@/i18n/routing";
import {notFound} from "next/navigation";

export async function generateMetadata({params}: PageProps<"/[locale]">): Promise<Metadata> {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({locale, namespace: "Metadata"});
  return {title: t("homeTitle"), description: t("homeDescription")};
}

export default async function Home({params}: PageProps<"/[locale]">) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  return (
    <div id="top" className="min-h-screen overflow-clip">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <HandmadeStory />
      </main>
      <Footer />
    </div>
  );
}
