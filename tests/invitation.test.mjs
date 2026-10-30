import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

import {getInvitationStep, transitionInvitation} from "../src/components/invitation/invitationMachine.ts";
import {localizePathname} from "../src/i18n/routing.ts";
import en from "../src/i18n/messages/en.ts";
import ptPT from "../src/i18n/messages/pt-PT.ts";

test("moves through the invitation scenes in order", () => {
  let scene = "sealed";
  scene = transitionInvitation(scene, "OPEN");
  assert.equal(scene, "letter");
  scene = transitionInvitation(scene, "CONTINUE");
  assert.equal(scene, "gift");
  scene = transitionInvitation(scene, "UNWRAP");
  assert.equal(scene, "completed");
  assert.equal(getInvitationStep(scene), 4);
});

test("ignores events that are invalid for the current scene and supports replay", () => {
  assert.equal(transitionInvitation("sealed", "UNWRAP"), "sealed");
  assert.equal(transitionInvitation("completed", "REPLAY"), "sealed");
});

test("preserves the invitation preview route when changing locale", () => {
  assert.equal(localizePathname("/invitation-preview", "en"), "/en/invitation-preview");
  assert.equal(localizePathname("/en/invitation-preview", "pt-PT"), "/invitation-preview");
  assert.equal(localizePathname("/invite/private-token", "en"), "/en/invite/private-token");
  assert.equal(localizePathname("/en/invite/private-token", "pt-PT"), "/invite/private-token");
});

test("language switching preserves the invitation query string", async () => {
  const clientLocale = await readFile(new URL("../src/i18n/clientLocale.ts", import.meta.url), "utf8");
  assert.match(clientLocale, /target\}\$\{window\.location\.search\}\$\{window\.location\.hash\}/);
});

test("provides natural Portuguese and English personalised invitation copy", () => {
  assert.equal(ptPT.Invitation.envelopePersonalisedLabel, "Para:");
  assert.equal(ptPT.Invitation.letterPersonalisedGreeting, "Olá, {name}!");
  assert.match(ptPT.Invitation.completedPersonalisedTitle, /^\{name\}, este Natal/);
  assert.equal(en.Invitation.envelopePersonalisedLabel, "For:");
  assert.equal(en.Invitation.letterPersonalisedGreeting, "Hello, {name}!");
  assert.match(en.Invitation.completedPersonalisedTitle, /^\{name\}, this Christmas/);
});

test("keeps dedicated and legacy invitation responses private and server-resolved", async () => {
  const previewPage = await readFile(new URL("../src/app/[locale]/invitation-preview/page.tsx", import.meta.url), "utf8");
  const invitePage = await readFile(new URL("../src/app/[locale]/invite/[token]/page.tsx", import.meta.url), "utf8");
  const resolvedInvitation = await readFile(new URL("../src/components/invitation/ResolvedInvitation.tsx", import.meta.url), "utf8");
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(previewPage, /token=\{query\.invite\}/);
  assert.match(invitePage, /token=\{token\}/);
  assert.match(resolvedInvitation, /resolveInvitation\(token\)/);
  assert.match(resolvedInvitation, /if \(!invitation\) redirect/);
  assert.match(resolvedInvitation, /recipientFirstName=\{invitation\.recipientFirstName \?\? undefined\}/);
  assert.match(config, /private, no-cache, no-store/);
  assert.match(config, /Referrer-Policy/);
  assert.match(config, /X-Robots-Tag/);
  assert.match(config, /\/invite\/:token/);
  assert.match(config, /\/en\/invite\/:token/);
});

test("ordinary locale routes never redirect into the invitation experience", async () => {
  const proxy = await readFile(new URL("../src/proxy.ts", import.meta.url), "utf8");
  const home = await readFile(new URL("../src/app/[locale]/page.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(proxy, /NEXT_LOCALE|invitation|invite/);
  assert.doesNotMatch(home, /ChristmasInvitation|resolveInvitation|redirect/);
});

test("invitation CLI creates dedicated personalised and generic bearer links", async () => {
  const script = await readFile(new URL("../scripts/invitations.ts", import.meta.url), "utf8");
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");

  assert.match(script, /`\/en\/invite\/\$\{token\}`/);
  assert.match(script, /`\/invite\/\$\{token\}`/);
  assert.match(script, /recipientFirstName: null/);
  assert.match(script, /command === "create-generic"/);
  assert.match(packageJson, /"invite:create-generic"/);
});

test("allows only the explicit local iPhone development host", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /allowedDevOrigins:\s*\["192\.168\.1\.115"\]/);
  assert.doesNotMatch(config, /allowedDevOrigins:\s*\[[^\]]*\*/);
  assert.doesNotMatch(config, /allowedDevOrigins:\s*\[[^\]]*https?:\/\//);
});

test("global reduced-motion handling collapses invitation animations", async () => {
  const css = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation-duration:\s*0\.01ms\s*!important/);
  assert.match(css, /transition-duration:\s*0\.01ms\s*!important/);
  assert.match(css, /\.invitation-atmosphere,[\s\S]*\.invitation-magic-burst[\s\S]*display:\s*none/);
});

test("letter scene uses the dedicated transparent elf artwork", async () => {
  const component = await readFile(new URL("../src/components/invitation/ElfLetter.tsx", import.meta.url), "utf8");

  assert.match(component, /\/images\/elf\/elf-letter\.png/);
  assert.doesNotMatch(component, /elf-knitting\.png/);
});

test("envelope controls share one safely skippable visual sequence", async () => {
  const component = await readFile(new URL("../src/components/invitation/SealedEnvelope.tsx", import.meta.url), "utf8");

  assert.equal([...component.matchAll(/onClick=\{activate\}/g)].length, 2);
  assert.doesNotMatch(component, /onAnimationEnd|envelopeTo/);
  assert.match(component, /EnvelopeArtwork/);
  assert.match(component, /phase:\s*"seal-open"/);
});

test("gift controls share the approved direct-to-open visual sequence", async () => {
  const component = await readFile(new URL("../src/components/invitation/WrappedGift.tsx", import.meta.url), "utf8");

  assert.equal([...component.matchAll(/onClick=\{activate\}/g)].length, 2);
  assert.doesNotMatch(component, /onAnimationEnd/);
  assert.match(component, /GiftArtwork/);
  assert.doesNotMatch(component, /phase:\s*"untie"/);
  assert.match(component, /phase:\s*"open"/);
});

test("approved invitation artwork maps only the rendered envelope and gift states", async () => {
  const component = await readFile(new URL("../src/components/invitation/InvitationArtwork.tsx", import.meta.url), "utf8");
  const expectedAssets = [
    "envelope-closed.png",
    "envelope-seal-open.png",
    "gift-closed.png",
    "gift-open.png",
  ];

  for (const asset of expectedAssets) assert.match(component, new RegExp(asset.replace(".", "\\.")));
  assert.doesNotMatch(component, /gift-untie\.png/);
  assert.equal([...component.matchAll(/\/images\/invitation\//g)].length, expectedAssets.length);
});
