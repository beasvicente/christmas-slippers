import Image from "next/image";
import {useTranslations} from "next-intl";

import { Button } from "@/components/ui/Button";
import { HollySprig, StarDivider } from "./Decorations";

const details = [
  { figure: "01", label: "detailDesign" },
  { figure: "02", label: "detailKnitting" },
  { figure: "03", label: "detailStory" },
];

export function HandmadeStory() {
  const t = useTranslations("Handmade");
  return (
    <section id="handmade" className="relative scroll-mt-20 overflow-hidden bg-forest px-5 py-20 text-snow sm:px-8 sm:py-28 lg:px-12" aria-labelledby="handmade-title">
      <div className="absolute -top-24 -right-24 size-80 rounded-full border border-gold/15" aria-hidden="true" />
      <div className="absolute -right-4 -bottom-32 size-96 rounded-full border border-snow/10" aria-hidden="true" />
      <HollySprig className="absolute top-10 right-5 hidden w-36 rotate-12 opacity-35 sm:block lg:right-16" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
        <div className="relative mx-auto w-full max-w-lg pt-56 sm:pt-72">
          <Image
            src="/images/elf/elf-hugging-knits.png"
            alt={t("elfAlt")}
            width={1122}
            height={1402}
            sizes="(max-width: 1023px) 72vw, 28vw"
            className="absolute top-0 left-1/2 h-auto w-[72%] -translate-x-1/2 drop-shadow-[0_18px_22px_rgba(18,39,28,0.28)] sm:w-[76%]"
          />
          <div className="storybook-frame relative -rotate-2 rounded-[2rem] bg-cream p-5 text-foreground sm:p-7">
            <div className="rounded-[1.35rem] border border-dashed border-gold/60 px-7 py-9 sm:px-10 sm:py-10">
              <span className="text-5xl text-cranberry" aria-hidden="true">“</span>
              <blockquote className="-mt-3 font-display text-3xl leading-[1.22] font-medium text-forest italic sm:text-4xl">
                {t("quote")}
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <span className="h-px w-10 bg-gold" />
                <p className="text-[10px] font-bold tracking-[0.24em] text-cranberry uppercase">{t("quoteBy")}</p>
              </div>
            </div>
            <span className="absolute -top-3 left-1/2 h-8 w-28 -translate-x-1/2 rotate-1 bg-gold/30 backdrop-blur-sm" aria-hidden="true" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.32em] text-gold uppercase sm:text-xs">{t("eyebrow")}</p>
          <h2 id="handmade-title" className="mt-5 max-w-2xl font-display text-4xl leading-[1.06] font-semibold sm:text-6xl">
            {t("title")}<br /><span className="text-gold italic">{t("titleAccent")}</span>
          </h2>
          <p className="mt-7 max-w-xl text-base leading-8 text-snow/75 sm:text-lg">
            {t("copy")}
          </p>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.figure} className="border-t border-gold/35 pt-4">
                <dt className="font-display text-2xl text-gold">{detail.figure}</dt>
                <dd className="mt-1 text-xs font-bold tracking-[0.08em] text-snow/75 uppercase">{t(detail.label)}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Button href="#how-it-works" variant="secondary" className="border-gold text-snow hover:border-cranberry">
              {t("steps")}
            </Button>
            <div className="hidden sm:block"><StarDivider light /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
