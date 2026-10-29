import assert from "node:assert/strict";
import test from "node:test";

import en from "../src/i18n/messages/en.ts";
import ptPT from "../src/i18n/messages/pt-PT.ts";
import {localizePathname, routing} from "../src/i18n/routing.ts";
import {getWorkshopDraft, resetWorkshopDraft, updateGift, updateWorkshopDraft} from "../src/state/workshopDraft.ts";

function keys(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "object" && child !== null ? keys(child, path) : [path];
  }).sort();
}

test("keeps English and European Portuguese message coverage in sync", () => {
  assert.deepEqual(keys(ptPT), keys(en));
});

test("uses unprefixed European Portuguese and explicit English routes", () => {
  assert.equal(routing.defaultLocale, "pt-PT");
  assert.equal(localizePathname("/workshop", "en"), "/en/workshop");
  assert.equal(localizePathname("/en/workshop", "pt-PT"), "/workshop");
  assert.equal(localizePathname("/", "en"), "/en");
});

test("language path changes do not mutate the in-memory workshop draft", () => {
  resetWorkshopDraft();
  updateWorkshopDraft((draft) => ({
    ...draft,
    validationRequested: true,
    configuration: {...draft.configuration, recipientName: "Bia", euSize: 39, colors: {stripe1: "01", stripe2: "56", ankle: "08", sole: "02"}},
  }));
  updateGift({expanded: true, requesterName: "Ana", requesterEmail: "ana@example.com", whatsappPhone: "+351912345678", christmasMessage: "Feliz Natal!", contactConsent: true});
  const before = structuredClone(getWorkshopDraft());

  localizePathname("/workshop", "en");

  assert.deepEqual(getWorkshopDraft(), before);
});
