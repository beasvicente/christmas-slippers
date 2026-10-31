import {getMessages} from "./dictionaries";
import type {AppLocale} from "./routing";

export type ApiErrorCode =
  | "mediaType"
  | "rateLimited"
  | "dailyQuota"
  | "botChallenge"
  | "deliveryDisabled"
  | "validation"
  | "tooLarge"
  | "unreadable"
  | "unavailable"
  | "delivery"
  | "accepted";

export function localeFromRequest(request: Request): AppLocale {
  return request.headers.get("accept-language")?.toLowerCase().startsWith("pt") ? "pt-PT" : "en";
}

export function apiMessage(locale: AppLocale, code: ApiErrorCode) {
  return getMessages(locale).ApiErrors[code];
}

export function validationMessage(locale: AppLocale, path: PropertyKey[]) {
  const key = path.join(".");
  const validation = getMessages(locale).Validation;
  if (key === "requester.name") return validation.requesterName;
  if (key === "requester.email") return validation.requesterEmail;
  if (key === "requester.whatsappPhone") return validation.whatsappPhone;
  if (key === "christmasMessage") return validation.christmasMessage;
  if (key === "contactConsent") return validation.contactConsent;
  return validation.configuration;
}
