import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="relative z-20 border-b border-gold/25 bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <a href="#top" className="group flex items-center gap-3" aria-label="Christmas Slippers, back to top">
          <span className="grid size-10 place-items-center rounded-full border border-cranberry/30 bg-snow text-cranberry transition-transform group-hover:rotate-6" aria-hidden="true">
            <svg viewBox="0 0 40 40" className="size-6" fill="none">
              <path d="M13 7c5-3 11 0 11 6 0 7-2 11-7 16-3 3-8 2-10-1-2-3 0-7 4-8l5-3c2-1 3-4 2-6l-1-4Z" fill="currentColor" />
              <path d="M13 9c3 2 7 2 10 0M9 23c4 3 8 3 12 0" stroke="var(--snow)" strokeWidth="1.5" strokeDasharray="2 2" />
            </svg>
          </span>
          <span>
            <span className="block whitespace-nowrap font-display text-lg leading-none font-semibold text-cranberry sm:text-xl">Christmas Slippers</span>
            <span className="mt-1 hidden text-[9px] font-bold tracking-[0.24em] text-forest uppercase sm:block">Made with a little magic</span>
          </span>
        </a>

        <nav aria-label="Main navigation" className="flex items-center gap-5 sm:gap-8">
          <a href="#how-it-works" className="hidden text-sm font-semibold text-foreground/75 transition-colors hover:text-cranberry sm:block">
            How it works
          </a>
          <a href="#handmade" className="hidden text-sm font-semibold text-foreground/75 transition-colors hover:text-cranberry md:block">
            Our craft
          </a>
          <div>
            <Button href="/workshop" className="px-4 py-2.5 text-xs sm:px-6 sm:text-sm" aria-label="Open the Christmas Slipper Workshop">
              <span className="min-[480px]:hidden">Workshop</span>
              <span className="hidden min-[480px]:inline">Make My Slippers</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
