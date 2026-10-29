"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import {
  getYarnColorById,
  type SlipperConfiguration,
} from "@/domain/slipper";

import { SLIPPER_YARN_ZONES } from "./configuratorSections";

interface GiftRequestFormProps {
  configuration: SlipperConfiguration;
  available: boolean;
}

type SubmissionStatus = "ready" | "sending" | "accepted" | "error";

interface ApiResponse {
  error?: string;
  fields?: Record<string, string>;
}

const INPUT_STYLES =
  "mt-2 min-h-12 w-full rounded-xl border border-gold/40 bg-snow px-4 py-3 text-base text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15";

export function GiftRequestForm({
  configuration,
  available,
}: GiftRequestFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>("ready");
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [christmasMessage, setChristmasMessage] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const statusRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "accepted" || status === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  function openReview() {
    setExpanded(true);
    requestAnimationFrame(() => firstFieldRef.current?.focus());
  }

  async function submitGiftRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || !available) return;

    setStatus("sending");
    setErrorMessage("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/gift-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configuration,
          requester: {
            name: requesterName,
            email: requesterEmail,
            whatsappPhone,
          },
          christmasMessage,
          contactConsent,
          website,
        }),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setFieldErrors(result.fields ?? {});
        setErrorMessage(
          result.error ?? "Your wish could not be sent just now. Please try again.",
        );
        setStatus("error");
        return;
      }

      setStatus("accepted");
    } catch {
      setErrorMessage(
        "The Christmas postbox could not be reached. Your details are still here—please try again.",
      );
      setStatus("error");
    }
  }

  if (!available && !expanded) return null;

  if (!expanded) {
    return (
      <section className="storybook-frame rounded-[2rem] bg-snow p-6 text-center sm:p-9" aria-labelledby="send-wish-title">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-gold/40 bg-cream text-2xl text-cranberry" aria-hidden="true">
          ✉
        </span>
        <p className="mt-5 text-[10px] font-bold tracking-[0.24em] text-gold uppercase">The Christmas postbox is open</p>
        <h2 id="send-wish-title" className="mt-2 font-display text-3xl font-semibold text-cranberry sm:text-4xl">
          Ready to send this wish?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-foreground/65">
          Review the finished design and leave your contact details so we can follow up about this Christmas request.
        </p>
        <Button type="button" className="mt-6 w-full sm:w-auto" onClick={openReview}>
          Send my Christmas wish
          <span aria-hidden="true">✦</span>
        </Button>
      </section>
    );
  }

  if (status === "accepted") {
    return (
      <section
        ref={statusRef}
        tabIndex={-1}
        className="storybook-frame rounded-[2rem] bg-snow p-7 text-center outline-none sm:p-10"
        aria-labelledby="wish-accepted-title"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-forest text-2xl text-snow" aria-hidden="true">✓</span>
        <h2 id="wish-accepted-title" className="mt-5 font-display text-4xl font-semibold text-cranberry">
          Your Christmas wish is on its way! 🎄
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-foreground/70">
          The notification was accepted for processing. This is not a purchase confirmation, final delivery receipt, or guarantee that the slippers will be made.
        </p>
      </section>
    );
  }

  return (
    <section className="storybook-frame rounded-[2rem] bg-snow p-5 sm:p-8 lg:p-10" aria-labelledby="wish-review-title">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cranberry font-display text-lg font-semibold text-snow" aria-hidden="true">03</span>
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] text-gold uppercase">Seal the envelope</p>
          <h2 id="wish-review-title" className="mt-1 font-display text-3xl font-semibold text-cranberry sm:text-4xl">Review and send your wish</h2>
          <p className="mt-3 text-sm leading-6 text-foreground/65">Nothing is purchased here. We&apos;ll use these details only to communicate about this request.</p>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-gold/30 bg-cream/60 p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold tracking-[0.12em] text-gold uppercase">Recipient</dt>
            <dd className="mt-1 font-semibold text-forest">{configuration.recipientName}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold tracking-[0.12em] text-gold uppercase">Size</dt>
            <dd className="mt-1 font-semibold text-forest">EU {configuration.euSize}</dd>
          </div>
          {SLIPPER_YARN_ZONES.map(({ section, label }) => {
            const selectedId = configuration.colors[section];
            const color = selectedId ? getYarnColorById(selectedId) : null;
            return (
              <div key={section}>
                <dt className="text-[10px] font-bold tracking-[0.12em] text-gold uppercase">{label}</dt>
                <dd className="mt-1 capitalize text-foreground/75">{color ? `${color.id} · ${color.name}` : "Not selected"}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      {!available ? (
        <p className="mt-6 rounded-xl border border-cranberry/25 bg-cranberry/5 px-4 py-3 text-sm font-semibold text-cranberry">
          Your design changed and needs another quick check above before it can be sent. Your contact details are still here.
        </p>
      ) : null}

      <form onSubmit={submitGiftRequest} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-forest">
            Your name <span className="text-cranberry" aria-hidden="true">*</span>
            <input
              ref={firstFieldRef}
              name="requesterName"
              autoComplete="name"
              required
              maxLength={80}
              value={requesterName}
              onChange={(event) => setRequesterName(event.target.value)}
              aria-invalid={Boolean(fieldErrors["requester.name"])}
              aria-describedby={fieldErrors["requester.name"] ? "requester-name-error" : undefined}
              className={INPUT_STYLES}
            />
            {fieldErrors["requester.name"] ? <span id="requester-name-error" className="mt-2 block text-xs text-cranberry">{fieldErrors["requester.name"]}</span> : null}
          </label>

          <label className="text-sm font-semibold text-forest">
            Email address <span className="text-cranberry" aria-hidden="true">*</span>
            <input
              name="requesterEmail"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={requesterEmail}
              onChange={(event) => setRequesterEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors["requester.email"])}
              aria-describedby={fieldErrors["requester.email"] ? "requester-email-error" : undefined}
              className={INPUT_STYLES}
            />
            {fieldErrors["requester.email"] ? <span id="requester-email-error" className="mt-2 block text-xs text-cranberry">{fieldErrors["requester.email"]}</span> : null}
          </label>
        </div>

        <label className="block text-sm font-semibold text-forest">
          WhatsApp number <span className="font-normal text-foreground/55">(optional)</span>
          <input
            name="whatsappPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+351 912 345 678"
            maxLength={40}
            value={whatsappPhone}
            onChange={(event) => setWhatsappPhone(event.target.value)}
            aria-invalid={Boolean(fieldErrors["requester.whatsappPhone"])}
            aria-describedby="whatsapp-help whatsapp-error"
            className={INPUT_STYLES}
          />
          <span id="whatsapp-help" className="mt-2 block text-xs leading-5 font-normal text-foreground/55">Include the country code. We may use it manually if a yarn colour needs a substitution or the wish needs clarification.</span>
          {fieldErrors["requester.whatsappPhone"] ? <span id="whatsapp-error" className="mt-1 block text-xs text-cranberry">{fieldErrors["requester.whatsappPhone"]}</span> : null}
        </label>

        <label className="block text-sm font-semibold text-forest">
          A short Christmas message <span className="font-normal text-foreground/55">(optional)</span>
          <textarea
            name="christmasMessage"
            rows={4}
            maxLength={500}
            value={christmasMessage}
            onChange={(event) => setChristmasMessage(event.target.value)}
            aria-invalid={Boolean(fieldErrors.christmasMessage)}
            className={`${INPUT_STYLES} resize-y`}
          />
          <span className="mt-1 block text-right text-xs font-normal text-foreground/45">{christmasMessage.length}/500</span>
        </label>

        <div className="absolute left-[-10000px] top-auto size-px overflow-hidden" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </label>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gold/30 bg-cream/50 p-4 text-sm leading-6 text-foreground/70">
          <input
            type="checkbox"
            required
            checked={contactConsent}
            onChange={(event) => setContactConsent(event.target.checked)}
            className="mt-1 size-5 shrink-0 accent-forest"
          />
          <span>I agree to be contacted about this specific Christmas wish by email and, when I provide a number, via WhatsApp. <strong className="text-forest">This box is not preselected.</strong></span>
        </label>
        {fieldErrors.contactConsent ? <p className="text-xs font-semibold text-cranberry">{fieldErrors.contactConsent}</p> : null}

        <p className="text-xs leading-5 text-foreground/55">Your contact details are sent privately to the configured workshop inbox. They are not placed in public pages, URLs or analytics, and no automated WhatsApp messages are sent.</p>

        <div ref={statusRef} tabIndex={-1} className="outline-none" aria-live="polite">
          {status === "error" ? (
            <p className="rounded-xl border border-cranberry/25 bg-cranberry/5 px-4 py-3 text-sm font-semibold text-cranberry">{errorMessage}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={status === "sending" || !available} className="w-full sm:w-auto">
          {status === "sending" ? "Sending your wish…" : status === "error" ? "Try sending again" : "Post my Christmas wish"}
          <span aria-hidden="true">{status === "sending" ? "·" : "✉"}</span>
        </Button>
      </form>
    </section>
  );
}

