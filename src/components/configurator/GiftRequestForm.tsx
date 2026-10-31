"use client";

import Image from "next/image";
import {useLocale, useTranslations} from "next-intl";
import {useCallback, useEffect, useRef, useState, type FormEvent} from "react";

import { Button } from "@/components/ui/Button";
import {
  getYarnColorById,
  type SlipperConfiguration,
} from "@/domain/slipper";

import { SLIPPER_YARN_ZONES } from "./configuratorSections";
import {updateGift, useWorkshopDraft} from "@/state/workshopDraft";
import type {ApiErrorCode} from "@/i18n/apiErrors";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "./TurnstileWidget";

interface GiftRequestFormProps {
  configuration: SlipperConfiguration;
  available: boolean;
  deliveryEnabled: boolean;
}

interface ApiResponse {
  code?: ApiErrorCode;
  error?: string;
  fields?: Record<string, string>;
}

const INPUT_STYLES =
  "mt-2 min-h-12 w-full rounded-xl border border-gold/40 bg-snow px-4 py-3 text-base text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15";

export function GiftRequestForm({
  configuration,
  available,
  deliveryEnabled,
}: GiftRequestFormProps) {
  const {gift} = useWorkshopDraft();
  const {expanded, status, requesterName, requesterEmail, whatsappPhone, christmasMessage, contactConsent, website, errorMessage, errorCode, fieldErrors} = gift;
  const locale = useLocale();
  const t = useTranslations("Gift");
  const zones = useTranslations("Zones");
  const validation = useTranslations("Validation");
  const apiErrors = useTranslations("ApiErrors");
  const statusRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  useEffect(() => {
    if (status === "accepted" || status === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  function openReview() {
    updateGift({expanded: true});
    requestAnimationFrame(() => firstFieldRef.current?.focus());
  }

  async function submitGiftRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || !available) return;
    if (!turnstileToken) {
      updateGift({status: "error", errorMessage: "", errorCode: "botChallenge", fieldErrors: {}});
      return;
    }

    updateGift({status: "sending", errorMessage: "", errorCode: undefined, fieldErrors: {}});

    try {
      const response = await fetch("/api/gift-requests", {
        method: "POST",
        headers: {"Content-Type": "application/json", "Accept-Language": locale},
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
          turnstileToken,
        }),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        turnstileRef.current?.reset();
        updateGift({fieldErrors: result.fields ?? {}, errorMessage: result.error ?? "", errorCode: result.code, status: "error"});
        return;
      }

      updateGift({status: "accepted"});
    } catch {
      turnstileRef.current?.reset();
      updateGift({errorMessage: "", errorCode: "network", status: "error"});
    }
  }

  if (!available && !expanded) return null;

  if (!deliveryEnabled) {
    return (
      <section className="storybook-frame rounded-[2rem] bg-snow p-6 text-center sm:p-9" aria-labelledby="delivery-disabled-title">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-gold/40 bg-cream text-2xl text-cranberry" aria-hidden="true">✉</span>
        <h2 id="delivery-disabled-title" className="mt-5 font-display text-3xl font-semibold text-cranberry sm:text-4xl">
          {t("deliveryDisabledTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-foreground/65">
          {t("deliveryDisabledCopy")}
        </p>
      </section>
    );
  }

  if (!expanded) {
    return (
      <section className="storybook-frame rounded-[2rem] bg-snow p-6 text-center sm:p-9" aria-labelledby="send-wish-title">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-gold/40 bg-cream text-2xl text-cranberry" aria-hidden="true">
          ✉
        </span>
        <p className="mt-5 text-[10px] font-bold tracking-[0.24em] text-gold uppercase">{t("postbox")}</p>
        <h2 id="send-wish-title" className="mt-2 font-display text-3xl font-semibold text-cranberry sm:text-4xl">
          {t("readyTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-foreground/65">
          {t("readyCopy")}
        </p>
        <Button type="button" className="mt-6 w-full sm:w-auto" onClick={openReview}>
          {t("readyButton")}
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
        <div className="mx-auto grid max-w-3xl items-center gap-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:text-left">
          <Image
            src="/images/elf/elf-presents.png"
            alt=""
            width={1122}
            height={1402}
            sizes="(max-width: 639px) 12rem, 13rem"
            className="mx-auto h-auto w-48 drop-shadow-[0_16px_18px_rgba(81,59,50,0.16)] sm:w-52"
          />
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-forest text-2xl text-snow sm:mx-0" aria-hidden="true">✓</span>
            <h2 id="wish-accepted-title" className="mt-5 font-display text-4xl font-semibold text-cranberry">
              {t("successTitle")}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-foreground/70">
              {t("successCopy")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="storybook-frame rounded-[2rem] bg-snow p-5 sm:p-8 lg:p-10" aria-labelledby="wish-review-title">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cranberry font-display text-lg font-semibold text-snow" aria-hidden="true">03</span>
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] text-gold uppercase">{t("reviewEyebrow")}</p>
          <h2 id="wish-review-title" className="mt-1 font-display text-3xl font-semibold text-cranberry sm:text-4xl">{t("reviewTitle")}</h2>
          <p className="mt-3 text-sm leading-6 text-foreground/65">{t("reviewCopy")}</p>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-gold/30 bg-cream/60 p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold tracking-[0.12em] text-gold uppercase">{t("recipient")}</dt>
            <dd className="mt-1 font-semibold text-forest">{configuration.recipientName}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold tracking-[0.12em] text-gold uppercase">{t("size")}</dt>
            <dd className="mt-1 font-semibold text-forest">EU {configuration.euSize}</dd>
          </div>
          {SLIPPER_YARN_ZONES.map((section) => {
            const selectedId = configuration.colors[section];
            const color = selectedId ? getYarnColorById(selectedId) : null;
            return (
              <div key={section}>
                <dt className="text-[10px] font-bold tracking-[0.12em] text-gold uppercase">{zones(`${section}.label`)}</dt>
                <dd className="mt-1 capitalize text-foreground/75">{color ? `${color.id} · ${color.name}` : t("notSelected")}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      {!available ? (
        <p className="mt-6 rounded-xl border border-cranberry/25 bg-cranberry/5 px-4 py-3 text-sm font-semibold text-cranberry">
          {t("changed")}
        </p>
      ) : null}

      <form onSubmit={submitGiftRequest} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-forest">
            {t("yourName")} <span className="text-cranberry" aria-hidden="true">*</span>
            <input
              ref={firstFieldRef}
              name="requesterName"
              autoComplete="name"
              required
              maxLength={80}
              value={requesterName}
              onChange={(event) => updateGift({requesterName: event.target.value})}
              aria-invalid={Boolean(fieldErrors["requester.name"])}
              aria-describedby={fieldErrors["requester.name"] ? "requester-name-error" : undefined}
              className={INPUT_STYLES}
            />
            {fieldErrors["requester.name"] ? <span id="requester-name-error" className="mt-2 block text-xs text-cranberry">{validation("requesterName")}</span> : null}
          </label>

          <label className="text-sm font-semibold text-forest">
            {t("email")} <span className="text-cranberry" aria-hidden="true">*</span>
            <input
              name="requesterEmail"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={requesterEmail}
              onChange={(event) => updateGift({requesterEmail: event.target.value})}
              aria-invalid={Boolean(fieldErrors["requester.email"])}
              aria-describedby={fieldErrors["requester.email"] ? "requester-email-error" : undefined}
              className={INPUT_STYLES}
            />
            {fieldErrors["requester.email"] ? <span id="requester-email-error" className="mt-2 block text-xs text-cranberry">{validation("requesterEmail")}</span> : null}
          </label>
        </div>

        <label className="block text-sm font-semibold text-forest">
          {t("whatsapp")} <span className="font-normal text-foreground/55">({t("optional")})</span>
          <input
            name="whatsappPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+351 912 345 678"
            maxLength={40}
            value={whatsappPhone}
            onChange={(event) => updateGift({whatsappPhone: event.target.value})}
            aria-invalid={Boolean(fieldErrors["requester.whatsappPhone"])}
            aria-describedby="whatsapp-help whatsapp-error"
            className={INPUT_STYLES}
          />
          <span id="whatsapp-help" className="mt-2 block text-xs leading-5 font-normal text-foreground/55">{t("whatsappHelp")}</span>
          {fieldErrors["requester.whatsappPhone"] ? <span id="whatsapp-error" className="mt-1 block text-xs text-cranberry">{validation("whatsappPhone")}</span> : null}
        </label>

        <label className="block text-sm font-semibold text-forest">
          {t("message")} <span className="font-normal text-foreground/55">({t("optional")})</span>
          <textarea
            name="christmasMessage"
            rows={4}
            maxLength={500}
            value={christmasMessage}
            onChange={(event) => updateGift({christmasMessage: event.target.value})}
            aria-invalid={Boolean(fieldErrors.christmasMessage)}
            className={`${INPUT_STYLES} resize-y`}
          />
          <span className="mt-1 block text-right text-xs font-normal text-foreground/45">{christmasMessage.length}/500</span>
        </label>

        <div className="absolute left-[-10000px] top-auto size-px overflow-hidden" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => updateGift({website: event.target.value})} />
          </label>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gold/30 bg-cream/50 p-4 text-sm leading-6 text-foreground/70">
          <input
            type="checkbox"
            required
            checked={contactConsent}
            onChange={(event) => updateGift({contactConsent: event.target.checked})}
            className="mt-1 size-5 shrink-0 accent-forest"
          />
          <span>{t("consent")} <strong className="text-forest">{t("consentNote")}</strong></span>
        </label>
        {fieldErrors.contactConsent ? <p className="text-xs font-semibold text-cranberry">{validation("contactConsent")}</p> : null}

        <p className="text-xs leading-5 text-foreground/55">{t("privacy")}</p>

        <div className="rounded-xl border border-gold/30 bg-cream/40 p-4">
          {siteKey ? (
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={siteKey}
              locale={locale}
              onTokenChange={handleTurnstileToken}
            />
          ) : (
            <p className="text-sm font-semibold text-cranberry">{t("challengeUnavailable")}</p>
          )}
          <p className="mt-2 text-xs leading-5 text-foreground/55">{t("challengeHelp")}</p>
        </div>

        <div ref={statusRef} tabIndex={-1} className="outline-none" aria-live="polite">
          {status === "error" ? (
            <p className="rounded-xl border border-cranberry/25 bg-cranberry/5 px-4 py-3 text-sm font-semibold text-cranberry">{errorCode === "network" ? t("networkError") : errorCode ? apiErrors(errorCode) : errorMessage || t("genericError")}</p>
          ) : null}
        </div>

        <Button type="submit" disabled={status === "sending" || !available || !siteKey || !turnstileToken} className="w-full sm:w-auto">
          {status === "sending" ? t("sending") : status === "error" ? t("retry") : t("submit")}
          <span aria-hidden="true">{status === "sending" ? "·" : "✉"}</span>
        </Button>
      </form>
    </section>
  );
}

