import { z } from "zod";

import { isYarnColorId, type YarnColorId } from "./yarnCatalogue";

export const SUPPORTED_EU_SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43] as const;

export type SupportedEuSize = (typeof SUPPORTED_EU_SIZES)[number];

export const SLIPPER_COLOR_SECTIONS = [
  "stripe1",
  "stripe2",
  "ankle",
  "sole",
] as const;

export type SlipperColorSection = (typeof SLIPPER_COLOR_SECTIONS)[number];

export interface SlipperConfiguration {
  recipientName: string;
  euSize: number | null;
  colors: {
    stripe1: YarnColorId | null;
    stripe2: YarnColorId | null;
    ankle: YarnColorId | null;
    sole: YarnColorId | null;
  };
}

export const INITIAL_SLIPPER_CONFIGURATION = {
  recipientName: "",
  euSize: null,
  colors: {
    stripe1: null,
    stripe2: null,
    ankle: null,
    sole: null,
  },
} as const satisfies SlipperConfiguration;

function isSupportedEuSize(value: unknown): value is SupportedEuSize {
  return (
    typeof value === "number" &&
    SUPPORTED_EU_SIZES.some((supportedSize) => supportedSize === value)
  );
}

export const yarnColorIdSchema = z.custom<YarnColorId>(isYarnColorId, {
  message: "Select a valid DROPS Snow colour",
});

export const supportedEuSizeSchema = z.custom<SupportedEuSize>(
  isSupportedEuSize,
  { message: "Select a supported EU shoe size" },
);

/**
 * Validates a configuration that is ready to leave the configurator boundary.
 * Draft state is represented by SlipperConfiguration and may contain nulls;
 * this schema intentionally rejects those incomplete values.
 */
export const slipperConfigurationSchema = z
  .object({
    recipientName: z
      .string()
      .trim()
      .min(1, "Enter the slipper recipient's name"),
    euSize: supportedEuSizeSchema,
    colors: z
      .object({
        stripe1: yarnColorIdSchema,
        stripe2: yarnColorIdSchema,
        ankle: yarnColorIdSchema,
        sole: yarnColorIdSchema,
      })
      .strict(),
  })
  .strict();

export type CompleteSlipperConfiguration = z.infer<
  typeof slipperConfigurationSchema
>;
