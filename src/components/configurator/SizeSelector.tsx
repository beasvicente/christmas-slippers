import { SUPPORTED_EU_SIZES } from "@/domain/slipper";

interface SizeSelectorProps {
  value: number | null;
  onChange: (size: number) => void;
  error?: string;
}

export function SizeSelector({ value, onChange, error }: SizeSelectorProps) {
  return (
    <fieldset
      data-validation-target
      data-invalid={Boolean(error)}
      tabIndex={error ? -1 : undefined}
      aria-describedby={error ? "eu-size-error" : "eu-size-hint"}
    >
      <legend className="font-display text-xl font-semibold text-forest">
        EU shoe size
      </legend>
      <p id="eu-size-hint" className="mt-1 text-sm leading-6 text-foreground/60">
        Choose the size that usually feels most comfortable.
      </p>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-9">
        {SUPPORTED_EU_SIZES.map((size) => (
          <label key={size} className="relative cursor-pointer">
            <input
              type="radio"
              name="eu-size"
              value={size}
              checked={value === size}
              onChange={() => onChange(size)}
              className="peer sr-only"
            />
            <span className="grid min-h-11 place-items-center rounded-xl border border-gold/35 bg-snow px-2 text-sm font-bold text-foreground transition-colors peer-checked:border-forest peer-checked:bg-forest peer-checked:text-snow peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-gold hover:border-cranberry/60">
              {size}
            </span>
          </label>
        ))}
      </div>

      {error ? (
        <p id="eu-size-error" className="mt-3 text-sm font-semibold text-cranberry" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
