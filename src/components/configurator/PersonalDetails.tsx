import { SizeSelector } from "./SizeSelector";

interface PersonalDetailsProps {
  recipientName: string;
  euSize: number | null;
  onRecipientNameChange: (name: string) => void;
  onEuSizeChange: (size: number) => void;
  errors?: {
    recipientName?: string;
    euSize?: string;
  };
}

export function PersonalDetails({
  recipientName,
  euSize,
  onRecipientNameChange,
  onEuSizeChange,
  errors,
}: PersonalDetailsProps) {
  return (
    <section aria-labelledby="personal-details-title">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cranberry font-display text-lg font-semibold text-snow shadow-sm" aria-hidden="true">
          01
        </span>
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] text-gold uppercase">
            Begin the wish
          </p>
          <h2 id="personal-details-title" className="mt-1 font-display text-3xl font-semibold text-cranberry sm:text-4xl">
            Who are these for?
          </h2>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <div>
          <label htmlFor="recipient-name" className="font-display text-xl font-semibold text-forest">
            Recipient&apos;s name
          </label>
          <p id="recipient-name-hint" className="mt-1 text-sm leading-6 text-foreground/60">
            The name we&apos;ll write on this little Christmas wish.
          </p>
          <input
            id="recipient-name"
            name="recipientName"
            type="text"
            autoComplete="name"
            value={recipientName}
            onChange={(event) => onRecipientNameChange(event.target.value)}
            data-validation-target
            data-invalid={Boolean(errors?.recipientName)}
            aria-invalid={Boolean(errors?.recipientName)}
            aria-describedby={errors?.recipientName ? "recipient-name-error" : "recipient-name-hint"}
            placeholder="e.g. Beatriz"
            className="mt-3 w-full rounded-2xl border border-gold/40 bg-snow px-5 py-3.5 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] placeholder:text-foreground/35 hover:border-gold focus:border-cranberry focus:outline-none focus:ring-3 focus:ring-gold/30"
          />
          {errors?.recipientName ? (
            <p id="recipient-name-error" className="mt-2 text-sm font-semibold text-cranberry" role="alert">
              {errors.recipientName}
            </p>
          ) : null}
        </div>

        <SizeSelector value={euSize} onChange={onEuSizeChange} error={errors?.euSize} />
      </div>
    </section>
  );
}
