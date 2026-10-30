import Image from "next/image";
import {useTranslations} from "next-intl";

export function ElfLetter({recipientFirstName, onContinue}: {recipientFirstName?: string; onContinue: () => void}) {
  const t = useTranslations("Invitation");

  return (
    <section className="invitation-scene invitation-scene-in flex min-h-[calc(100svh-8rem)] items-center px-5 pt-10 pb-24 sm:px-8 sm:py-10" aria-labelledby="letter-title">
      <div className="relative mx-auto grid w-full max-w-6xl items-end gap-2 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="invitation-letter relative z-10 rounded-[1.25rem] border border-gold/35 bg-[#fffaf0] px-6 py-8 text-left shadow-[0_28px_70px_rgba(81,59,50,.18)] sm:px-12 sm:py-11 lg:rotate-[-.5deg]">
          <span className="absolute top-0 left-1/2 h-7 w-28 -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] bg-gold/25" aria-hidden="true" />
          <div className="border border-dashed border-gold/55 px-5 pt-6 pb-28 sm:px-10 sm:py-8">
            <p className="text-[10px] font-bold tracking-[0.28em] text-cranberry uppercase">{t("letterEyebrow")}</p>
            <h1 id="letter-title" className="mt-4 font-display text-3xl font-semibold text-forest italic sm:text-4xl">
              {recipientFirstName ? t("letterPersonalisedGreeting", {name: recipientFirstName}) : t("letterGreeting")}
            </h1>
            <div className="mt-5 space-y-4 text-sm leading-7 text-cocoa/80 sm:text-base sm:leading-8">
              <p>{t("letterParagraph1")}</p>
              <p>{t("letterParagraph2")}</p>
              <p>{t("letterParagraph3")}</p>
              <p className="font-display text-xl font-semibold text-cranberry italic sm:text-2xl">{t("letterQuestion")}</p>
            </div>
            <div className="mt-6">
              <p className="text-sm text-cocoa/65">{t("letterClosing")}</p>
              <p className="mt-1 -rotate-1 font-display text-2xl font-semibold text-cranberry italic sm:text-3xl">{t("letterSignature")}</p>
            </div>
            <button type="button" onClick={onContinue} className="mt-7 min-h-12 rounded-full bg-forest px-7 py-3 text-sm font-bold text-snow shadow-[0_9px_22px_rgba(37,73,54,.2)] transition hover:-translate-y-0.5 hover:bg-cranberry">
              {t("letterAction")} <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>

        <div className="absolute -right-2 -bottom-20 z-20 w-40 sm:relative sm:right-auto sm:bottom-auto sm:mx-auto sm:mt-4 sm:w-64 lg:-mt-5 lg:-ml-20 lg:mb-2 lg:w-96">
          <span className="absolute right-2 bottom-3 left-2 h-10 rounded-[50%] bg-cocoa/15 blur-md" aria-hidden="true" />
          <Image src="/images/elf/elf-letter.png" alt="" width={1122} height={1402} sizes="(max-width: 639px) 10rem, (max-width: 1023px) 16rem, 24rem" className="relative h-auto w-full drop-shadow-[0_18px_18px_rgba(81,59,50,.18)]" priority />
        </div>
      </div>
    </section>
  );
}
