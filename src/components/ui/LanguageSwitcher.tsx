"use client";

import {startTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import type {AppLocale} from "@/i18n/routing";
import {updateBrowserLocale} from "@/i18n/clientLocale";

const choices: Array<{locale: AppLocale; short: string; name: "portuguese" | "english"}> = [
  {locale: "pt-PT", short: "PT", name: "portuguese"},
  {locale: "en", short: "EN", name: "english"},
];

export function LanguageSwitcher({className = ""}: {className?: string}) {
  const activeLocale = useLocale();
  const router = useRouter();
  const t = useTranslations("Language");

  function switchLocale(locale: AppLocale) {
    if (locale === activeLocale) return;
    updateBrowserLocale(locale);
    startTransition(() => router.refresh());
  }

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border border-gold/50 bg-cream/80 p-1 ${className}`} role="group" aria-label={t("label")}>
      {choices.map(({locale, short, name}) => {
        const active = activeLocale === locale;
        return (
          <button
            key={locale}
            type="button"
            aria-pressed={active}
            aria-label={t("switchTo", {language: t(name)})}
            onClick={() => switchLocale(locale)}
            className={`min-h-8 min-w-9 rounded-full px-2 text-xs font-bold tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${active ? "bg-forest text-cream" : "text-cocoa hover:bg-gold/15"}`}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
