import {
  getYarnColorById,
} from "../../domain/slipper/yarnCatalogue";
import type {
  SlipperColorSection,
  SlipperConfiguration,
} from "../../domain/slipper/slipperConfiguration";

export type SlipperMaterialColors = Record<SlipperColorSection, string>;

export const NEUTRAL_SLIPPER_MATERIALS: SlipperMaterialColors = {
  stripe1: "#C9B9A5",
  stripe2: "#E0D4C2",
  ankle: "#A99783",
  sole: "#6E6259",
};

export function resolveSlipperMaterialColors(
  colors: SlipperConfiguration["colors"],
): SlipperMaterialColors {
  return {
    stripe1: colors.stripe1
      ? getYarnColorById(colors.stripe1).approximateHex
      : NEUTRAL_SLIPPER_MATERIALS.stripe1,
    stripe2: colors.stripe2
      ? getYarnColorById(colors.stripe2).approximateHex
      : NEUTRAL_SLIPPER_MATERIALS.stripe2,
    ankle: colors.ankle
      ? getYarnColorById(colors.ankle).approximateHex
      : NEUTRAL_SLIPPER_MATERIALS.ankle,
    sole: colors.sole
      ? getYarnColorById(colors.sole).approximateHex
      : NEUTRAL_SLIPPER_MATERIALS.sole,
  };
}
