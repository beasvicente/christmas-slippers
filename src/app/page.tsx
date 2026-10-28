import { Button } from "@/components/ui/Button";

const colors = [
  { name: "Christmas Cream", hex: "#F8F1E4" },
  { name: "Cranberry Red", hex: "#922E3A" },
  { name: "Forest Green", hex: "#254936" },
  { name: "Antique Gold", hex: "#C59A50" },
  { name: "Cocoa Brown", hex: "#513B32" },
  { name: "Snow White", hex: "#FFFDF8" },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-cranberry">
            Est. Christmas 2026
          </p>

          <span className="text-4xl text-gold" aria-hidden="true">
            ✳
          </span>

          <h1 className="mt-5 font-display text-5xl leading-tight text-cranberry sm:text-7xl">
            The Christmas
            <br />
            Slipper Workshop
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-foreground">
            A little Christmas magic, one stitch at a time. Handmade with love,
            designed by you.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button>Enter the Workshop</Button>
            <Button variant="secondary">Explore the Collection</Button>
          </div>

          <p className="mt-4 text-xs text-foreground/60">
            Design system preview — buttons are not linked yet.
          </p>
        </div>

        <section className="mt-24 border-t border-gold/40 pt-12">
          <h2 className="font-display text-3xl text-forest">
            Our Christmas Palette
          </h2>

          <p className="mt-3 text-sm text-foreground/70">
            Inspired by vintage holiday cards, cozy wool, and beautifully
            wrapped Christmas presents.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {colors.map((color) => (
              <div
                key={color.name}
                className="rounded-2xl bg-snow p-3 shadow-sm"
              >
                <div
                  className="h-24 rounded-xl border border-foreground/10"
                  style={{
                    backgroundColor: color.hex,
                  }}
                />
                <h3 className="mt-3 font-sans text-sm font-semibold">
                  {color.name}
                </h3>
                <p className="mt-1 text-xs text-foreground/60">{color.hex}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20 text-center text-xs text-foreground/60">
          Made with love and a little Christmas magic.
        </footer>
      </div>
    </main>
  );
}
