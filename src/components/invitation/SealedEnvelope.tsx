"use client";

import {useTranslations} from "next-intl";
import {EnvelopeArtwork, type EnvelopePhase} from "./InvitationArtwork";
import {useVisualSequence} from "./useVisualSequence";

const ENVELOPE_SEQUENCE = [
  {phase: "seal-open", durationMs: 620},
] as const satisfies ReadonlyArray<{phase: EnvelopePhase; durationMs: number}>;

export function SealedEnvelope({recipientFirstName, onOpen}: {recipientFirstName?: string; onOpen: () => void}) {
  const t = useTranslations("Invitation");
  const {phase, activate} = useVisualSequence<EnvelopePhase>({
    initialPhase: "closed",
    steps: ENVELOPE_SEQUENCE,
    onComplete: onOpen,
  });

  return (
    <section className="invitation-scene invitation-scene-in grid min-h-[calc(100svh-8rem)] place-items-center px-5 py-10 text-center" aria-labelledby="sealed-title">
      <div className="w-full max-w-4xl">
        <p className="text-[10px] font-bold tracking-[0.32em] text-gold uppercase sm:text-xs">{t("sealedEyebrow")}</p>
        <h1 id="sealed-title" className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-[1.02] font-semibold text-cranberry sm:text-6xl lg:text-7xl">{t("sealedTitle")}</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-cocoa/70 sm:text-lg">{t("sealedCopy")}</p>

        <button type="button" onClick={activate} aria-label={t("sealLabel")} className="group mx-auto mt-6 block w-full max-w-[32rem] rounded-[1.75rem] focus-visible:outline-offset-8">
          <EnvelopeArtwork
            phase={phase}
            postalMark={t("postalMark")}
            personalisedLabel={recipientFirstName ? t("envelopePersonalisedLabel") : undefined}
            recipientName={recipientFirstName}
          />
        </button>

        <button type="button" onClick={activate} className="mt-3 min-h-12 rounded-full bg-forest px-8 py-3 text-sm font-bold text-snow shadow-[0_10px_26px_rgba(37,73,54,.2)] transition hover:-translate-y-0.5 hover:bg-cranberry">
          {t("sealedAction")} <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
