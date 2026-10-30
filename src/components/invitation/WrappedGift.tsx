"use client";

import {useTranslations} from "next-intl";
import {GiftArtwork, type GiftPhase} from "./InvitationArtwork";
import {useVisualSequence} from "./useVisualSequence";

const GIFT_SEQUENCE = [
  {phase: "open", durationMs: 650},
] as const satisfies ReadonlyArray<{phase: GiftPhase; durationMs: number}>;

export function WrappedGift({onUnwrap}: {onUnwrap: () => void}) {
  const t = useTranslations("Invitation");
  const {phase, activate} = useVisualSequence<GiftPhase>({
    initialPhase: "closed",
    steps: GIFT_SEQUENCE,
    onComplete: onUnwrap,
  });

  return (
    <section className="invitation-scene invitation-scene-in grid min-h-[calc(100svh-8rem)] place-items-center px-5 py-10 text-center" aria-labelledby="gift-title">
      <div className="w-full max-w-3xl">
        <p className="text-[10px] font-bold tracking-[0.3em] text-gold uppercase sm:text-xs">{t("giftEyebrow")}</p>
        <h1 id="gift-title" className="mt-4 font-display text-4xl font-semibold text-cranberry sm:text-6xl">{t("giftTitle")}</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-cocoa/70">{t("giftCopy")}</p>

        <button type="button" onClick={activate} aria-label={t("giftLabel")} className="group mx-auto mt-5 block w-full max-w-[24rem] rounded-[1.75rem] focus-visible:outline-offset-8">
          <GiftArtwork phase={phase} />
        </button>

        <button type="button" onClick={activate} className="mt-3 min-h-12 rounded-full bg-forest px-8 py-3 text-sm font-bold text-snow shadow-[0_10px_26px_rgba(37,73,54,.2)] transition hover:-translate-y-0.5 hover:bg-cranberry">
          {t("giftAction")} <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
