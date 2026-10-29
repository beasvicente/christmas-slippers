import { StarDivider } from "./Decorations";

const steps = [
  {
    number: "01",
    title: "Choose your size",
    description: "Begin with the perfect cosy fit, made for slow mornings, tree-trimming, and every fireside moment.",
    icon: (
      <svg viewBox="0 0 64 64" className="size-12" fill="none" aria-hidden="true">
        <path d="M17 12v37M17 19h9M17 28h6M17 37h9M17 46h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M38 16c7 7 10 15 9 25-1 7-6 12-12 11-5-1-7-7-4-11l6-8c3-4 3-10 1-17Z" fill="currentColor" opacity=".16" />
        <path d="M38 16c7 7 10 15 9 25-1 7-6 12-12 11-5-1-7-7-4-11l6-8c3-4 3-10 1-17Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Pick your colours",
    description: "Pair cranberry, forest, cream, and gold into a combination that feels unmistakably like your Christmas.",
    icon: (
      <svg viewBox="0 0 64 64" className="size-12" fill="none" aria-hidden="true">
        <circle cx="25" cy="33" r="15" fill="currentColor" opacity=".16" />
        <circle cx="39" cy="26" r="15" stroke="currentColor" strokeWidth="2" />
        <circle cx="25" cy="38" r="15" stroke="currentColor" strokeWidth="2" />
        <circle cx="39" cy="26" r="4" fill="currentColor" />
        <circle cx="25" cy="38" r="4" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Send your wish",
    description: "Review your one-of-a-kind design, add a heartfelt note, and send the maker your Christmas wish.",
    icon: (
      <svg viewBox="0 0 64 64" className="size-12" fill="none" aria-hidden="true">
        <path d="M12 20h40v29H12z" fill="currentColor" opacity=".14" />
        <path d="M12 20h40v29H12zM13 22l19 15 19-15" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="m43 11 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="currentColor" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-y border-gold/25 bg-snow px-5 py-20 sm:px-8 sm:py-28 lg:px-12" aria-labelledby="how-title">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold tracking-[0.32em] text-cranberry uppercase sm:text-xs">A wish in three little steps</p>
          <h2 id="how-title" className="mt-4 font-display text-4xl leading-tight font-semibold text-forest sm:text-6xl">How the magic works</h2>
          <p className="mt-5 text-base leading-7 text-foreground/70">A simple ritual for turning your favourite Christmas colours into something warm, personal, and wonderfully wearable.</p>
          <div className="mt-7"><StarDivider /></div>
        </div>

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-5 lg:mt-18 lg:gap-8">
          <div className="absolute top-16 right-[17%] left-[17%] hidden border-t border-dashed border-gold/50 md:block" aria-hidden="true" />
          {steps.map((step) => (
            <li key={step.number} className="group relative rounded-[1.75rem] border border-gold/25 bg-cream p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-8">
              <div className="relative flex items-start justify-between">
                <div className="grid size-20 place-items-center rounded-full border border-gold/35 bg-snow text-cranberry shadow-[0_8px_24px_rgba(81,59,50,0.08)] transition-colors group-hover:text-forest">
                  {step.icon}
                </div>
                <span className="font-display text-4xl font-semibold text-gold/45">{step.number}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl font-semibold text-cranberry sm:text-3xl">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-foreground/70 sm:text-base">{step.description}</p>
              <div className="mt-7 h-px bg-[linear-gradient(90deg,var(--gold)_40%,transparent_40%)] bg-[length:10px_1px]" aria-hidden="true" />
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-6 text-foreground/55">
          Personalisation and the interactive colour preview are ready in the workshop. Gift requests are not collected yet.
        </p>
      </div>
    </section>
  );
}
