import { getYarnColorById, type SlipperConfiguration } from "@/domain/slipper";

import { SLIPPER_YARN_ZONES } from "./configuratorSections";
import { YarnSwatch } from "./YarnSwatch";

interface ConfigurationSummaryProps {
  configuration: SlipperConfiguration;
  completedChoices: number;
  isComplete: boolean;
}

export function ConfigurationSummary({
  configuration,
  completedChoices,
  isComplete,
}: ConfigurationSummaryProps) {
  const remainingChoices = 6 - completedChoices;

  return (
    <aside
      className="order-3 rounded-[1.75rem] border border-gold/35 bg-forest p-6 text-snow shadow-[0_20px_55px_rgba(37,73,54,0.18)] lg:order-none"
      aria-labelledby="wish-card-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.24em] text-gold uppercase">Your workshop card</p>
          <h2 id="wish-card-title" className="mt-2 font-display text-3xl font-semibold">Your slipper wish</h2>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-bold tracking-[0.12em] uppercase ${isComplete ? "border-gold/50 bg-gold/15 text-gold" : "border-snow/20 bg-snow/8 text-snow/65"}`}>
          {isComplete ? "Complete" : "Draft"}
        </span>
      </div>

      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-snow/15"
        aria-label={`${completedChoices} of 6 design details complete`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={6}
        aria-valuenow={completedChoices}
      >
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-300"
          style={{ width: `${(completedChoices / 6) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-snow/65">
        {isComplete
          ? "All six design details are ready"
          : `${remainingChoices} ${remainingChoices === 1 ? "choice" : "choices"} still waiting`}
      </p>

      <dl className="mt-7 space-y-4 border-t border-snow/15 pt-6">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-xs font-bold tracking-[0.12em] text-gold uppercase">Recipient</dt>
          <dd className={`max-w-[60%] break-words text-right text-sm font-semibold ${configuration.recipientName.trim() ? "text-snow" : "text-snow/55 italic"}`}>
            {configuration.recipientName.trim() || "Add a name"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-xs font-bold tracking-[0.12em] text-gold uppercase">EU size</dt>
          <dd className={`text-right text-sm font-semibold ${configuration.euSize ? "text-snow" : "text-snow/55 italic"}`}>
            {configuration.euSize ? `EU ${configuration.euSize}` : "Choose a size"}
          </dd>
        </div>

        {SLIPPER_YARN_ZONES.map(({ section, label }) => {
          const selectedId = configuration.colors[section];
          const color = selectedId ? getYarnColorById(selectedId) : null;

          return (
            <div key={section} className="flex items-center gap-3 border-t border-snow/10 pt-3">
              {color ? (
                <YarnSwatch color={color} className="size-8 shrink-0" />
              ) : (
                <span className="size-8 shrink-0 rounded-full border border-dashed border-snow/35" aria-hidden="true" />
              )}
              <dt className="text-[10px] font-bold tracking-[0.1em] text-gold uppercase">{label}</dt>
              <dd className={`ml-auto min-w-0 max-w-[55%] text-right text-xs capitalize ${color ? "text-snow/80" : "text-snow/55 italic"}`}>
                {color ? `${color.id} · ${color.name}` : "Choose a colour"}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className={`mt-7 rounded-xl border p-4 ${isComplete ? "border-gold/35 bg-gold/10" : "border-snow/15 bg-snow/8"}`}>
        <p className={`font-display text-lg ${isComplete ? "text-gold" : "text-snow/80"}`}>
          {isComplete ? "Your design is complete." : "This design is still a draft."}
        </p>
        <p className="mt-2 text-xs leading-5 text-snow/65">
          {isComplete
            ? "Everything is ready for review, but no gift request has been sent."
            : "Choose the remaining details when you are ready. Nothing is submitted from this page."}
        </p>
      </div>
    </aside>
  );
}
