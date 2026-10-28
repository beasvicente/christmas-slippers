import type { CSSProperties } from "react";

import type { YarnColor } from "@/domain/slipper";

interface YarnSwatchProps {
  color: YarnColor;
  className?: string;
}

function getSwatchBackground(color: YarnColor): string {
  const palette = color.representativeHexes;

  if (!palette || palette.length < 2) {
    return color.approximateHex;
  }

  const stopSize = 100 / palette.length;
  const stops = palette.flatMap((hex, index) => [
    `${hex} ${index * stopSize}%`,
    `${hex} ${(index + 1) * stopSize}%`,
  ]);

  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

export function YarnSwatch({ color, className = "" }: YarnSwatchProps) {
  return (
    <span
      className={`relative block overflow-hidden rounded-full border border-foreground/15 shadow-[inset_0_0_0_2px_rgba(255,253,248,0.45)] ${className}`}
      style={{ background: getSwatchBackground(color) } as CSSProperties}
      aria-hidden="true"
    >
      {color.yarnType !== "uni" ? (
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.5)_0_1px,transparent_1.5px)] bg-[length:7px_7px] opacity-60" />
      ) : null}
    </span>
  );
}
