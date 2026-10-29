import type { Metadata } from "next";
import Link from "next/link";

import { SlipperConfigurator } from "@/components/configurator/SlipperConfigurator";

export const metadata: Metadata = {
  title: "Christmas Slipper Workshop | Personalise Your Pair",
  description:
    "Choose a name, size, and DROPS Snow yarn colours for a handmade Christmas slipper wish.",
};

function WorkshopOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 150"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path d="M60 0v28" stroke="currentColor" strokeWidth="1.5" />
      <path d="M46 27h28v15H46z" fill="var(--gold)" />
      <circle cx="60" cy="87" r="42" fill="var(--cranberry)" />
      <path
        d="M27 73c20 11 46 11 66 0M24 91c23 12 49 12 72 0M31 111c19 9 39 9 58 0"
        stroke="var(--snow)"
        strokeWidth="2"
        strokeDasharray="4 5"
        opacity=".7"
      />
      <circle cx="60" cy="87" r="34" stroke="var(--gold)" opacity=".7" />
    </svg>
  );
}

export default function WorkshopPage() {
  return (
    <div className="min-h-screen overflow-clip">
      <header className="border-b border-gold/25 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Christmas Slippers home">
            <span>
              <span className="block font-display text-lg leading-none font-semibold text-cranberry sm:text-xl">Christmas Slippers</span>
              <span className="mt-1 hidden text-[9px] font-bold tracking-[0.24em] text-forest uppercase sm:block">Made with a little magic</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center text-xs font-bold tracking-[0.12em] text-forest uppercase underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-cranberry sm:text-sm">
            <span aria-hidden="true">← </span>Back home
          </Link>
        </div>
      </header>

      <main>
        <section className="relative isolate border-b border-gold/20 px-5 pt-14 pb-20 text-center sm:px-8 sm:pt-20 sm:pb-24 lg:px-12">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,var(--snow)_0%,transparent_62%)]" aria-hidden="true" />
          <WorkshopOrnament className="gentle-float absolute -top-6 -left-5 w-20 text-gold opacity-35 sm:left-[5%] sm:w-28" />
          <WorkshopOrnament className="gentle-float absolute -top-14 -right-7 w-24 text-gold opacity-30 sm:right-[6%] sm:w-32" />
          <div className="mx-auto max-w-3xl">
            <p className="text-[10px] font-bold tracking-[0.3em] text-gold uppercase sm:text-xs">Step inside the Christmas workshop</p>
            <h1 className="mt-5 text-5xl leading-[0.98] font-semibold text-cranberry sm:text-6xl lg:text-7xl">
              Make a slipper wish,
              <span className="block text-forest italic">one colour at a time.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-foreground/70 sm:text-lg">
              Add a name, find the right fit, then wander through all 87 DROPS Snow yarns to choose four cosy details.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-snow/80 px-4 py-2 text-xs font-semibold text-forest shadow-sm">
              <span className="text-gold" aria-hidden="true">✦</span>
              No order is placed here—this is your personalisation card.
            </p>
          </div>
        </section>

        <section className="relative px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20" aria-label="Slipper personalisation form">
          <div className="mx-auto max-w-7xl">
            <SlipperConfigurator />
          </div>
        </section>
      </main>

      <footer className="border-t border-gold/25 bg-cranberry px-5 py-8 text-snow sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="font-display text-xl font-semibold">Made for warm feet and thoughtful Christmas wishes.</p>
          <p className="text-xs text-snow/65">Personalisation requests are reviewed by hand—no purchase is made here.</p>
        </div>
      </footer>
    </div>
  );
}
