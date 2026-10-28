export function StarDivider({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden="true">
      <span className={`h-px w-10 ${light ? "bg-snow/30" : "bg-gold/50"}`} />
      <span className={light ? "text-gold" : "text-cranberry"}>✦</span>
      <span className={`h-px w-10 ${light ? "bg-snow/30" : "bg-gold/50"}`} />
    </div>
  );
}

export function Snowfall() {
  const flakes = [
    { left: "8%", delay: "-1s", duration: "7s", size: "text-xs" },
    { left: "21%", delay: "-4s", duration: "9s", size: "text-[8px]" },
    { left: "42%", delay: "-2s", duration: "8s", size: "text-[10px]" },
    { left: "63%", delay: "-6s", duration: "10s", size: "text-xs" },
    { left: "79%", delay: "-3s", duration: "7.5s", size: "text-[8px]" },
    { left: "93%", delay: "-5s", duration: "9.5s", size: "text-[10px]" },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden" aria-hidden="true">
      {flakes.map((flake) => (
        <span
          key={flake.left}
          className={`snowflake absolute top-0 text-gold/70 ${flake.size}`}
          style={{
            left: flake.left,
            "--snow-delay": flake.delay,
            "--snow-duration": flake.duration,
          } as React.CSSProperties}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

export function HollySprig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 72"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path d="M58 58C53 38 38 20 15 9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M47 42C29 44 13 34 10 18c12-4 28 1 37 24Z"
        fill="var(--forest)"
        stroke="var(--snow)"
        strokeOpacity=".45"
      />
      <path
        d="M56 49c2-20 15-37 35-44 8 13 2 34-35 44Z"
        fill="var(--forest)"
        stroke="var(--snow)"
        strokeOpacity=".45"
      />
      <circle cx="57" cy="52" r="9" fill="var(--cranberry)" />
      <circle cx="72" cy="54" r="8" fill="var(--cranberry)" />
      <circle cx="64" cy="64" r="8" fill="var(--cranberry)" />
      <circle cx="53" cy="49" r="2" fill="var(--snow)" fillOpacity=".7" />
    </svg>
  );
}
