import {localizePathname, type AppLocale} from "./routing";

export function updateBrowserLocale(locale: AppLocale) {
  document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  const target = localizePathname(window.location.pathname, locale);
  window.history.pushState(null, "", `${target}${window.location.search}${window.location.hash}`);
  document.documentElement.lang = locale;
}
