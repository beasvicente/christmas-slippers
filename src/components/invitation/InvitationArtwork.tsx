import Image from "next/image";

export type EnvelopePhase = "closed" | "seal-open";
export type GiftPhase = "closed" | "open";

const ENVELOPE_IMAGES: Record<EnvelopePhase, string> = {
  closed: "/images/invitation/envelope-closed.png",
  "seal-open": "/images/invitation/envelope-seal-open.png",
};

const GIFT_IMAGES: Record<GiftPhase, string> = {
  closed: "/images/invitation/gift-closed.png",
  open: "/images/invitation/gift-open.png",
};

function ArtworkImage({src, visible, sizes}: {src: string; visible: boolean; sizes: string}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      className={`object-contain transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      priority
    />
  );
}

function SealSparkles() {
  return (
    <span className="invitation-seal-sparkles pointer-events-none absolute inset-0" aria-hidden="true">
      {[
        ["43%", "48%", "0ms"],
        ["48%", "43%", "60ms"],
        ["57%", "45%", "100ms"],
        ["61%", "54%", "150ms"],
        ["54%", "60%", "200ms"],
        ["45%", "58%", "240ms"],
      ].map(([left, top, delay]) => (
        <span key={`${left}-${top}`} className="invitation-art-sparkle absolute text-gold" style={{left, top, animationDelay: delay}}>✦</span>
      ))}
    </span>
  );
}

export function EnvelopeArtwork({
  phase,
  postalMark,
  personalisedLabel,
  recipientName,
}: {
  phase: EnvelopePhase;
  postalMark: string;
  personalisedLabel?: string;
  recipientName?: string;
}) {
  const [postalHeading, postalDetail] = postalMark.split(" · ");

  return (
    <span className="pointer-events-none relative block aspect-square transition-transform duration-300 group-hover:-translate-y-1" aria-hidden="true">
      {(Object.entries(ENVELOPE_IMAGES) as Array<[EnvelopePhase, string]>).map(([imagePhase, src]) => (
        <ArtworkImage key={imagePhase} src={src} visible={phase === imagePhase} sizes="(max-width: 639px) calc(100vw - 2.5rem), 32rem" />
      ))}
      <span className="absolute top-[30.5%] left-[66.2%] flex w-[18.5%] -rotate-[2deg] flex-col items-center text-center font-bold leading-tight tracking-[0.08em] text-cranberry/80 uppercase">
        <span className="text-[clamp(6px,1.25vw,10px)]">{postalHeading}</span>
        <span className="mt-[18%] text-[clamp(5px,1.05vw,8px)]">{postalDetail}</span>
      </span>
      {personalisedLabel && recipientName ? (
        <span className="absolute top-[24.5%] left-[20%] flex w-[39%] -rotate-1 flex-col items-start text-left text-[#7B3940] mix-blend-multiply">
          <span className="font-display text-[clamp(6px,1vw,9px)] leading-none font-normal italic">{personalisedLabel}</span>
          <span
            className="mt-[1.5%] max-w-full text-[clamp(15px,3vw,26px)] leading-[0.95] font-normal tracking-normal [overflow-wrap:anywhere]"
            style={{fontFamily: "var(--font-allura), cursive"}}
          >
            {recipientName}
          </span>
        </span>
      ) : null}
      {phase === "seal-open" ? <SealSparkles /> : null}
    </span>
  );
}

export function GiftArtwork({phase}: {phase: GiftPhase}) {
  return (
    <span className={`invitation-gift-artwork pointer-events-none relative block aspect-square transition-transform duration-300 group-hover:-translate-y-1 ${phase === "open" ? "invitation-gift-open-response" : ""}`} aria-hidden="true">
      {(Object.entries(GIFT_IMAGES) as Array<[GiftPhase, string]>).map(([imagePhase, src]) => (
        <ArtworkImage key={imagePhase} src={src} visible={phase === imagePhase} sizes="(max-width: 639px) calc(100vw - 2.5rem), 24rem" />
      ))}
    </span>
  );
}
