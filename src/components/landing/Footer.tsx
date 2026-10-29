import Link from "next/link";

import { HollySprig } from "./Decorations";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-gold/25 bg-cranberry px-5 pt-16 pb-8 text-snow sm:px-8 lg:px-12">
      <HollySprig className="absolute -top-1 -left-8 w-32 -rotate-12 opacity-50 sm:w-40" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-snow/20 pb-12 md:grid-cols-[1.4fr_0.6fr] md:items-end">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-gold uppercase">Christmas Slippers</p>
            <p className="mt-4 max-w-xl font-display text-3xl leading-tight font-semibold sm:text-5xl">
              Here&apos;s to warm feet and wonderful Christmas stories.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm md:justify-self-end">
            <a href="#top" className="text-snow/75 transition-colors hover:text-gold">Back to top</a>
            <a href="#how-it-works" className="text-snow/75 transition-colors hover:text-gold">How it works</a>
            <a href="#handmade" className="text-snow/75 transition-colors hover:text-gold">Our craft</a>
            <Link href="/workshop" className="text-snow/75 transition-colors hover:text-gold">Open workshop</Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-7 text-[11px] leading-5 text-snow/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Christmas Slippers. An open-source project made with care.</p>
          <p>Original illustrations · No orders are collected yet</p>
        </div>
      </div>
    </footer>
  );
}
