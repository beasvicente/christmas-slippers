import type {CSSProperties} from "react";
import type {InvitationScene} from "./invitationMachine";

const FALLING_STARS = [
  {left: "8%", size: ".6rem", opacity: .32, delay: "-3s", duration: "15s"},
  {left: "22%", size: ".85rem", opacity: .48, delay: "-9s", duration: "19s"},
  {left: "39%", size: ".55rem", opacity: .36, delay: "-13s", duration: "17s"},
  {left: "57%", size: ".75rem", opacity: .42, delay: "-6s", duration: "21s"},
  {left: "74%", size: ".5rem", opacity: .3, delay: "-16s", duration: "18s"},
  {left: "89%", size: ".8rem", opacity: .4, delay: "-11s", duration: "22s"},
] as const;

const BURST_STARS = [
  {x: "-3.4rem", y: "-2.6rem", delay: "0ms"},
  {x: "2.8rem", y: "-3.5rem", delay: "60ms"},
  {x: "4.2rem", y: ".8rem", delay: "110ms"},
  {x: "-4.5rem", y: "1.5rem", delay: "150ms"},
  {x: ".6rem", y: "3.8rem", delay: "190ms"},
] as const;

type BurstStyle = CSSProperties & {"--burst-x": string; "--burst-y": string};

function MagicBurst({kind}: {kind: "envelope" | "gift"}) {
  return (
    <div className={`invitation-magic-burst invitation-magic-burst-${kind} pointer-events-none fixed inset-0 z-30`} aria-hidden="true">
      {BURST_STARS.map(({x, y, delay}) => (
        <span key={`${x}-${y}`} className="invitation-burst-star absolute text-gold" style={{"--burst-x": x, "--burst-y": y, animationDelay: delay} as BurstStyle}>✦</span>
      ))}
    </div>
  );
}

export function InvitationSparkles({scene}: {scene: InvitationScene}) {
  return (
    <>
      <div className="invitation-atmosphere pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {FALLING_STARS.map(({left, size, opacity, delay, duration}) => (
          <span key={left} className="invitation-falling-star absolute top-[-8vh] text-gold" style={{left, fontSize: size, opacity, animationDelay: `${delay}, ${delay}`, animationDuration: `${duration}, 3.4s`}}>✦</span>
        ))}
      </div>
      {scene === "letter" ? <MagicBurst kind="envelope" /> : null}
      {scene === "completed" ? <MagicBurst kind="gift" /> : null}
    </>
  );
}
