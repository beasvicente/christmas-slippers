"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

import {
  DROPS_SNOW_CATALOGUE_METADATA,
  DROPS_SNOW_YARN_COLORS,
  getYarnColorById,
  type SlipperColorSection,
  type YarnColorId,
} from "@/domain/slipper";

import { filterYarnColors } from "./yarnSearch";
import { YarnSwatch } from "./YarnSwatch";

interface YarnColorPickerProps {
  section: SlipperColorSection;
  label: string;
  description: string;
  selectedId: YarnColorId | null;
  onChange: (colorId: YarnColorId | null) => void;
  error?: string;
}

export function YarnColorPicker({
  section,
  label,
  description,
  selectedId,
  onChange,
  error,
}: YarnColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelId = useId();
  const listId = useId();
  const disclosureRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedColor = selectedId ? getYarnColorById(selectedId) : null;
  const filteredColors = useMemo(
    () => filterYarnColors(DROPS_SNOW_YARN_COLORS, query),
    [query],
  );

  function selectColor(colorId: YarnColorId) {
    onChange(colorId);
    setIsOpen(false);
    setQuery("");
    requestAnimationFrame(() => disclosureRef.current?.focus());
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const lastIndex = filteredColors.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      case "Escape":
        setIsOpen(false);
        disclosureRef.current?.focus();
        break;
      default:
        return;
    }

    event.preventDefault();
    if (nextIndex !== null) {
      optionRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <section
      className={`rounded-[1.6rem] border bg-cream/70 p-4 sm:p-5 ${
        error ? "border-cranberry/60" : "border-gold/30"
      }`}
      aria-labelledby={`${panelId}-label`}
    >
      <div className="flex items-start gap-3">
        <button
          ref={disclosureRef}
          type="button"
          data-validation-target
          data-invalid={Boolean(error)}
          aria-describedby={error ? `${panelId}-error` : undefined}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((current) => !current)}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
        >
          {selectedColor ? (
            <YarnSwatch color={selectedColor} className="size-12 shrink-0" />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-dashed border-gold bg-snow text-xl text-gold" aria-hidden="true">
              +
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span id={`${panelId}-label`} className="block font-display text-xl font-semibold text-forest">
              {label}
            </span>
            <span className="mt-0.5 block truncate text-xs text-foreground/60">
              {selectedColor
                ? `${selectedColor.id} · ${selectedColor.name}`
                : description}
            </span>
          </span>
          <span className={`text-cranberry transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
            ↓
          </span>
        </button>

        {selectedColor ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-full px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-cranberry uppercase underline decoration-gold/60 underline-offset-4 hover:text-forest"
            aria-label={`Clear ${label} colour`}
          >
            Clear
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={`${panelId}-error`} className="mt-3 text-sm font-semibold text-cranberry" role="alert">
          {error}
        </p>
      ) : null}

      {isOpen ? (
        <div
          id={panelId}
          className="mt-5 border-t border-gold/25 pt-5"
          onKeyDown={(event) => {
            if (event.key === "Escape" && event.target instanceof HTMLInputElement) {
              event.preventDefault();
              setIsOpen(false);
              disclosureRef.current?.focus();
            }
          }}
        >
          <label htmlFor={`${panelId}-search`} className="text-xs font-bold tracking-[0.12em] text-cranberry uppercase">
            Search the yarn shelf
          </label>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-foreground/45" aria-hidden="true">
              ⌕
            </span>
            <input
              id={`${panelId}-search`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try ‘56’ or ‘christmas red’"
              aria-controls={listId}
              className="w-full rounded-xl border border-gold/35 bg-snow py-3 pr-4 pl-10 text-sm placeholder:text-foreground/35 focus:border-cranberry focus:outline-none focus:ring-3 focus:ring-gold/30"
            />
          </div>

          <p className="mt-3 text-xs text-foreground/55" aria-live="polite">
            {filteredColors.length} {filteredColors.length === 1 ? "colour" : "colours"} found
          </p>

          {filteredColors.length > 0 ? (
            <ul id={listId} className="mt-3 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3" aria-label={`${label} yarn colours`}>
              {filteredColors.map((color, index) => {
                const isSelected = color.id === selectedId;

                return (
                  <li key={color.id}>
                    <button
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      type="button"
                      data-yarn-option
                      aria-pressed={isSelected}
                      onClick={() => selectColor(color.id)}
                      onKeyDown={(event) => handleOptionKeyDown(event, index)}
                      className={`relative flex h-full min-h-20 w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${
                        isSelected
                          ? "border-forest bg-forest text-snow shadow-sm"
                          : "border-gold/25 bg-snow text-foreground hover:border-cranberry/50 hover:bg-white"
                      }`}
                    >
                      <YarnSwatch color={color} className="size-9 shrink-0" />
                      <span className="min-w-0">
                        <span className={`block text-[10px] font-bold tracking-[0.12em] uppercase ${isSelected ? "text-gold" : "text-cranberry"}`}>
                          No. {color.id} · {color.yarnType}
                        </span>
                        <span className="mt-1 block text-xs leading-4 font-semibold capitalize">
                          {color.name}
                        </span>
                      </span>
                      {isSelected ? (
                        <span className="absolute top-1.5 right-1.5 text-gold" aria-hidden="true">✓</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-gold/40 bg-snow px-5 py-8 text-center">
              <p className="font-display text-lg text-forest">No yarns found on this shelf.</p>
              <button type="button" onClick={() => setQuery("")} className="mt-2 text-sm font-semibold text-cranberry underline decoration-gold underline-offset-4">
                Clear the search
              </button>
            </div>
          )}

          <p className="mt-4 text-[11px] leading-5 text-foreground/55">
            All listed colours can be requested. Retailer stock was last checked on {DROPS_SNOW_CATALOGUE_METADATA.verifiedOn}; availability will be confirmed later.
          </p>
        </div>
      ) : null}

      <input type="hidden" name={`colors.${section}`} value={selectedId ?? ""} />
    </section>
  );
}
