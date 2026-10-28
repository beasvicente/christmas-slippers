import { Button } from "@/components/ui/Button";
import { HollySprig, Snowfall, StarDivider } from "./Decorations";
import { SlipperArtwork } from "./SlipperArtwork";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-28 lg:px-12 lg:pt-24" aria-labelledby="hero-title">
      <Snowfall />
      <div className="absolute top-0 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-[50%] bg-snow/60 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <div className="relative z-10 text-center lg:text-left">
          <div className="mb-7 flex items-center justify-center gap-3 lg:justify-start">
            <span className="hidden h-px w-8 shrink-0 bg-gold min-[420px]:block" />
            <p className="min-w-0 text-[9px] leading-5 font-bold tracking-[0.22em] text-cranberry uppercase min-[420px]:text-[10px] sm:text-xs sm:tracking-[0.3em]">
              The Christmas workshop · Est. 2026
            </p>
          </div>

          <h1 id="hero-title" className="font-display text-[2.8rem] leading-[0.92] font-semibold tracking-[-0.045em] text-cranberry min-[420px]:text-[3.4rem] sm:text-[5rem] lg:text-[clamp(4.6rem,7.5vw,6.8rem)] lg:leading-[0.88]">
            A little magic,
            <span className="mt-2 block text-forest italic">made for your feet.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-base leading-8 text-foreground/80 sm:text-lg lg:mx-0 lg:max-w-lg">
            Dream up a pair of knitted Christmas slippers, choose every cosy colour, and send your wish to someone who makes them slowly, warmly, and by hand.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Button href="#how-it-works" className="w-full px-8 py-4 text-base sm:w-auto" aria-describedby="workshop-note">
              Make My Slippers
              <span aria-hidden="true">→</span>
            </Button>
            <a href="#handmade" className="group inline-flex items-center gap-2 px-4 py-3 text-sm font-bold text-cranberry underline decoration-gold/70 decoration-1 underline-offset-8 transition-colors hover:text-forest">
              Discover the handmade story
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">↓</span>
            </a>
          </div>
          <p id="workshop-note" className="mt-5 text-xs leading-5 text-foreground/60">
            The workshop is still being stitched together. Preview the three-step journey below.
          </p>

          <div className="mt-10 lg:hidden">
            <StarDivider />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[650px] lg:ml-auto">
          <div className="gentle-float relative rotate-[1.5deg] rounded-[2.25rem] bg-snow p-4 shadow-[0_30px_90px_rgba(81,59,50,0.15)] sm:p-6">
            <div className="rounded-[1.7rem] border border-gold/45 p-3 sm:p-5">
              <div className="relative overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_center,#fffdf8_0%,#f4e7d3_100%)]">
                <SlipperArtwork />
                <span className="absolute right-5 bottom-5 rounded-full border border-gold/40 bg-snow/90 px-4 py-2 text-[9px] font-bold tracking-[0.2em] text-forest uppercase backdrop-blur-sm sm:right-8 sm:bottom-8 sm:text-[10px]">
                  Knitted by hand
                </span>
              </div>
            </div>
          </div>
          <HollySprig className="absolute -right-3 -bottom-7 w-28 rotate-12 text-forest sm:-right-7 sm:w-36" />
          <div className="absolute -top-5 -left-3 grid size-16 -rotate-12 place-items-center rounded-full border border-gold/50 bg-cranberry font-display text-[10px] leading-tight font-bold tracking-[0.12em] text-snow uppercase shadow-lg sm:-left-7 sm:size-20">
            <span>Made<br />with love</span>
          </div>
        </div>
      </div>
    </section>
  );
}
