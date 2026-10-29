import {defineRouting} from "next-intl/routing";

export const locales = ["pt-PT", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "pt-PT",
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: {name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365},
});

export function isAppLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}

export function localizePathname(pathname: string, locale: AppLocale): string {
  const unprefixed = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return locale === "en" ? `/en${unprefixed === "/" ? "" : unprefixed}` : unprefixed;
}
