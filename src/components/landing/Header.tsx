import { Button } from "@/components/ui/Button";
import {LanguageSwitcher} from "@/components/ui/LanguageSwitcher";
import {useTranslations} from "next-intl";

export function Header() {
  const t = useTranslations("Header");
  const brand = useTranslations("Brand");
  return (
    <header className="relative z-20 border-b border-gold/25 bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <a href="#top" aria-label={t("backToTop")}>
          <span>
            <span className="block whitespace-nowrap font-display text-lg leading-none font-semibold text-cranberry sm:text-xl">Christmas Slippers</span>
            <span className="mt-1 hidden text-[9px] font-bold tracking-[0.24em] text-forest uppercase sm:block">{brand("tagline")}</span>
          </span>
        </a>

        <nav aria-label={t("navigation")} className="flex items-center gap-2 sm:gap-5 lg:gap-8">
          <a href="#how-it-works" className="hidden text-sm font-semibold text-foreground/75 transition-colors hover:text-cranberry sm:block">
            {t("howItWorks")}
          </a>
          <a href="#handmade" className="hidden text-sm font-semibold text-foreground/75 transition-colors hover:text-cranberry md:block">
            {t("craft")}
          </a>
          <div>
            <Button href="/workshop" className="px-3 py-2.5 text-xs sm:px-5 sm:text-sm" aria-label={t("openWorkshop")}>
              <span className="min-[560px]:hidden">{t("workshop")}</span>
              <span className="hidden min-[560px]:inline">{t("makeSlippers")}</span>
            </Button>
          </div>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
