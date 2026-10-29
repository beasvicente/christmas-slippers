"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import {
  INITIAL_SLIPPER_CONFIGURATION,
  type SlipperColorSection,
  type SlipperConfiguration,
  type YarnColorId,
} from "@/domain/slipper";

import { PersonalDetails } from "./PersonalDetails";
import { ConfigurationSummary } from "./ConfigurationSummary";
import { SLIPPER_YARN_ZONES } from "./configuratorSections";
import { validateConfiguration } from "./configurationValidation";
import { YarnColorPicker } from "./YarnColorPicker";

const SlipperViewer = dynamic(
  () =>
    import("@/components/three/SlipperViewer").then(
      (module) => module.SlipperViewer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-96 place-items-center rounded-[1.75rem] border border-gold/35 bg-snow px-8 text-center shadow-[0_20px_55px_rgba(81,59,50,0.12)]">
        <p className="font-display text-xl font-semibold text-forest">
          Opening the fitting-room window…
        </p>
      </div>
    ),
  },
);

function createInitialConfiguration(): SlipperConfiguration {
  return {
    ...INITIAL_SLIPPER_CONFIGURATION,
    colors: { ...INITIAL_SLIPPER_CONFIGURATION.colors },
  };
}

export function SlipperConfigurator() {
  const [configuration, setConfiguration] = useState<SlipperConfiguration>(
    createInitialConfiguration,
  );
  const [validationRequested, setValidationRequested] = useState(false);
  const validation = useMemo(
    () => validateConfiguration(configuration),
    [configuration],
  );

  const completedChoices =
    Number(configuration.recipientName.trim().length > 0) +
    Number(configuration.euSize !== null) +
    Object.values(configuration.colors).filter(Boolean).length;

  function updateRecipientName(recipientName: string) {
    setConfiguration((current) => ({ ...current, recipientName }));
  }

  function updateEuSize(euSize: number) {
    setConfiguration((current) => ({ ...current, euSize }));
  }

  function updateColor(section: SlipperColorSection, colorId: YarnColorId | null) {
    setConfiguration((current) => ({
      ...current,
      colors: { ...current.colors, [section]: colorId },
    }));
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationRequested(true);

    if (!validation.isValid) {
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>('[data-validation-target][data-invalid="true"]')
          ?.focus();
      });
    }
  }

  const visibleErrors = validationRequested ? validation.errors : undefined;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem] xl:gap-12">
      <form
        noValidate
        onSubmit={handleReview}
        className="storybook-frame order-2 rounded-[2rem] bg-snow p-5 sm:p-8 lg:order-none lg:p-10"
      >
        <PersonalDetails
          recipientName={configuration.recipientName}
          euSize={configuration.euSize}
          onRecipientNameChange={updateRecipientName}
          onEuSizeChange={updateEuSize}
          errors={visibleErrors}
        />

        <div className="my-10 h-px bg-[linear-gradient(90deg,var(--gold)_40%,transparent_40%)] bg-[length:12px_1px]" aria-hidden="true" />

        <section aria-labelledby="yarn-colours-title">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cranberry font-display text-lg font-semibold text-snow shadow-sm" aria-hidden="true">
              02
            </span>
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] text-gold uppercase">
                Visit the yarn shelf
              </p>
              <h2 id="yarn-colours-title" className="mt-1 font-display text-3xl font-semibold text-cranberry sm:text-4xl">
                Pick every cosy colour
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/65 sm:text-base">
                Each part can have its own DROPS Snow yarn—or share a favourite colour. Mixed and printed yarns show a representative digital palette.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-2">
            {SLIPPER_YARN_ZONES.map((zone) => (
              <YarnColorPicker
                key={zone.section}
                {...zone}
                selectedId={configuration.colors[zone.section]}
                onChange={(colorId) => updateColor(zone.section, colorId)}
                error={visibleErrors?.colors[zone.section]}
              />
            ))}
          </div>
        </section>

        <div className="mt-10 border-t border-gold/25 pt-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl font-semibold text-forest">Ready for a little check?</p>
              <p className="mt-1 text-sm text-foreground/60">This only checks your choices. No gift request is sent yet.</p>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Check my choices
              <span aria-hidden="true">✓</span>
            </Button>
          </div>

          <div className="mt-5 min-h-6" aria-live="polite" aria-atomic="true">
            {validationRequested && validation.isValid ? (
              <p className="rounded-xl border border-forest/25 bg-forest/8 px-4 py-3 text-sm font-semibold text-forest">
                Lovely—your design is complete and ready to review. No gift request has been sent.
              </p>
            ) : validationRequested ? (
              <p className="text-sm font-semibold text-cranberry">
                A few details still need your Christmas touch. We&apos;ve marked them above.
              </p>
            ) : null}
          </div>
        </div>
      </form>

      <div className="contents lg:sticky lg:top-6 lg:order-none lg:block lg:space-y-5">
        <div className="order-1 lg:order-none">
          <SlipperViewer colors={configuration.colors} />
        </div>

        <ConfigurationSummary
          configuration={configuration}
          completedChoices={completedChoices}
          isComplete={validation.isValid}
        />
      </div>
    </div>
  );
}
