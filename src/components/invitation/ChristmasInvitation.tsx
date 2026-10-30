"use client";

import {useReducer} from "react";
import {useTranslations} from "next-intl";
import {LanguageSwitcher} from "@/components/ui/LanguageSwitcher";
import {Link} from "@/i18n/navigation";
import {CompletedInvitation} from "./CompletedInvitation";
import {ElfLetter} from "./ElfLetter";
import {InvitationSparkles} from "./InvitationSparkles";
import {getInvitationStep, transitionInvitation, type InvitationEvent, type InvitationScene} from "./invitationMachine";
import {SealedEnvelope} from "./SealedEnvelope";
import {WrappedGift} from "./WrappedGift";

function invitationReducer(scene: InvitationScene, event: InvitationEvent) {
  return transitionInvitation(scene, event);
}

export function ChristmasInvitation({recipientFirstName}: {recipientFirstName?: string}) {
  const [scene, dispatch] = useReducer(invitationReducer, "sealed");
  const t = useTranslations("Invitation");
  const step = getInvitationStep(scene);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-cream">
      <InvitationSparkles scene={scene} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_42%,var(--snow)_0%,transparent_62%)]" aria-hidden="true" />
      <header className="relative z-20 border-b border-gold/25 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="min-w-0" aria-label="Christmas Slippers">
            <span className="block truncate font-display text-lg leading-none font-semibold text-cranberry sm:text-xl">Christmas Slippers</span>
            <span className="mt-1 hidden text-[9px] font-bold tracking-[0.22em] text-forest uppercase sm:block">{t("brandNote")}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link href="/" className="inline-flex min-h-11 items-center text-xs font-bold text-forest underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-cranberry">{t("skip")}</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <p className="sr-only" aria-live="polite">{t("progress", {current: step})}</p>
        {scene === "sealed" ? <SealedEnvelope recipientFirstName={recipientFirstName} onOpen={() => dispatch("OPEN")} /> : null}
        {scene === "letter" ? <ElfLetter recipientFirstName={recipientFirstName} onContinue={() => dispatch("CONTINUE")} /> : null}
        {scene === "gift" ? <WrappedGift onUnwrap={() => dispatch("UNWRAP")} /> : null}
        {scene === "completed" ? <CompletedInvitation recipientFirstName={recipientFirstName} onReplay={() => dispatch("REPLAY")} /> : null}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-1 bg-gold/15" aria-hidden="true">
        <div className="h-full bg-cranberry transition-[width] duration-300" style={{width: `${(step / 4) * 100}%`}} />
      </div>
    </div>
  );
}
