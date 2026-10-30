import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {InvitationSlipperPreview} from "./InvitationSlipperPreview";

export function CompletedInvitation({recipientFirstName, onReplay}: {recipientFirstName?: string; onReplay: () => void}) {
  const t = useTranslations("Invitation");
  return (
    <section className="invitation-scene invitation-scene-in grid min-h-[calc(100svh-8rem)] place-items-center px-5 py-10 text-center" aria-labelledby="completed-title">
      <div className="relative w-full max-w-6xl rounded-[2rem] border border-gold/40 bg-snow p-3 shadow-[0_32px_80px_rgba(81,59,50,.2)] sm:rounded-[3rem] sm:p-5">
        <div className="relative overflow-hidden rounded-[1.4rem] border border-dashed border-gold/65 px-5 py-8 sm:rounded-[2.3rem] sm:px-10 sm:py-10">
          <div className="absolute -top-20 -left-20 size-52 rounded-full border-[28px] border-forest/8" aria-hidden="true" />
          <div className="absolute -right-16 -bottom-20 size-48 rounded-full border-[26px] border-cranberry/8" aria-hidden="true" />
          <div className="relative grid items-center gap-4 lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
            <div className="invitation-final-art-in"><InvitationSlipperPreview label={t("slipperPreviewAlt")} /></div>
            <div className="invitation-final-copy-in pb-3 lg:text-left">
              <p className="text-[10px] font-bold tracking-[0.32em] text-gold uppercase sm:text-xs">✦ {t("completedEyebrow")} ✦</p>
              <h1 id="completed-title" className="mt-4 font-display text-4xl leading-[1.04] font-semibold text-cranberry sm:text-5xl lg:text-[3.4rem]">
                {recipientFirstName ? t("completedPersonalisedTitle", {name: recipientFirstName}) : t("completedTitle")}
              </h1>
              <p className="mt-5 font-display text-xl leading-8 text-forest italic sm:text-2xl">{t("completedCopy")}</p>
              <div className="mx-auto mt-7 flex max-w-lg items-center gap-3 lg:mx-0" aria-hidden="true"><span className="h-px flex-1 bg-gold/50" /><span className="text-gold">◆</span><span className="h-px flex-1 bg-gold/50" /></div>
              <Link href="/workshop" className="mt-7 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest px-9 py-3.5 text-sm font-bold text-snow shadow-[0_12px_28px_rgba(37,73,54,.24)] transition hover:-translate-y-0.5 hover:bg-cranberry">
                {t("completedAction")} <span aria-hidden="true">→</span>
              </Link>
              <p className="mt-4 max-w-lg text-xs leading-5 text-cocoa/55">{t("completedNote")}</p>
              <button type="button" onClick={onReplay} className="mt-4 min-h-11 px-4 text-xs font-bold text-cranberry underline decoration-gold decoration-2 underline-offset-4 hover:text-forest">{t("replay")}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
