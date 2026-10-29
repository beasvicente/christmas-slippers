import type { SlipperColorSection } from "@/domain/slipper";

export const SLIPPER_MODEL_ZONES = [
  "stripe1",
  "stripe2",
  "ankle",
  "sole",
] as const satisfies readonly SlipperColorSection[];

export const SLIPPER_ZONE_TOKENS: Record<SlipperColorSection, string> = {
  stripe1: "CS_STRIPE1",
  stripe2: "CS_STRIPE2",
  ankle: "CS_ANKLE",
  sole: "CS_SOLE",
};

/**
 * The GLB is expected to contain the complete pair, centred on X/Z with its
 * soles resting at Y=0. See public/models/README.md for the authoring contract.
 */
export const SLIPPER_MODEL_ASSET = {
  url: "/models/sailor-slippers.glb",
  position: [0, -0.48, 0] as const,
  rotation: [0, 0, 0] as const,
  scale: 1,
};
