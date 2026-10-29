import type { SlipperColorSection } from "@/domain/slipper";

export const SLIPPER_YARN_ZONES: ReadonlyArray<{
  section: SlipperColorSection;
  label: string;
  description: string;
}> = [
  { section: "stripe1", label: "Stripe 1", description: "Choose the first knitted stripe" },
  { section: "stripe2", label: "Stripe 2", description: "Choose the second knitted stripe" },
  { section: "ankle", label: "Ankle", description: "Choose the cosy opening colour" },
  { section: "sole", label: "Sole", description: "Choose the colour underfoot" },
];

export function getSlipperZoneLabel(section: SlipperColorSection): string {
  return SLIPPER_YARN_ZONES.find((zone) => zone.section === section)?.label ?? section;
}
