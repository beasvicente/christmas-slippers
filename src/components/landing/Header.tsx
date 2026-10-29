import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="relative z-20 border-b border-gold/25 bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <a href="#top" aria-label="Christmas Slippers, back to top">
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
