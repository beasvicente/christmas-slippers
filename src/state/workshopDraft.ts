"use client";

import {useSyncExternalStore} from "react";
import {INITIAL_SLIPPER_CONFIGURATION, type SlipperConfiguration} from "../domain/slipper/index";
import type {ApiErrorCode} from "../i18n/apiErrors";

export type SubmissionStatus = "ready" | "sending" | "accepted" | "error";

export interface GiftRequestDraft {
  expanded: boolean;
  status: SubmissionStatus;
  requesterName: string;
  requesterEmail: string;
  whatsappPhone: string;
  christmasMessage: string;
  contactConsent: boolean;
  website: string;
  errorMessage: string;
  errorCode?: ApiErrorCode | "network";
  fieldErrors: Record<string, string>;
}

export interface WorkshopDraft {
  configuration: SlipperConfiguration;
  validationRequested: boolean;
  gift: GiftRequestDraft;
}

export function createWorkshopDraft(): WorkshopDraft {
  return {
    configuration: {...INITIAL_SLIPPER_CONFIGURATION, colors: {...INITIAL_SLIPPER_CONFIGURATION.colors}},
    validationRequested: false,
    gift: {expanded: false, status: "ready", requesterName: "", requesterEmail: "", whatsappPhone: "", christmasMessage: "", contactConsent: false, website: "", errorMessage: "", fieldErrors: {}},
  };
}

let draft = createWorkshopDraft();
const serverDraft = createWorkshopDraft();
const listeners = new Set<() => void>();

function emit() { listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
export function getWorkshopDraft() { return draft; }
export function updateWorkshopDraft(update: (current: WorkshopDraft) => WorkshopDraft) { draft = update(draft); emit(); }
export function resetWorkshopDraft() { draft = createWorkshopDraft(); emit(); }
export function useWorkshopDraft() { return useSyncExternalStore(subscribe, getWorkshopDraft, () => serverDraft); }

export function updateConfiguration(update: (current: SlipperConfiguration) => SlipperConfiguration) {
  updateWorkshopDraft((current) => ({...current, configuration: update(current.configuration)}));
}

export function updateGift(update: Partial<GiftRequestDraft>) {
  updateWorkshopDraft((current) => ({...current, gift: {...current.gift, ...update}}));
}
