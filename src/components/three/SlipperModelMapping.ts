import { Color, Mesh, type Material, type Object3D } from "three";

import type { SlipperColorSection } from "@/domain/slipper";

import {
  SLIPPER_MODEL_ZONES,
  SLIPPER_ZONE_TOKENS,
} from "./SlipperModelAsset";
import type { SlipperMaterialColors } from "./SlipperMaterials";

export type SlipperZoneCounts = Record<SlipperColorSection, number>;

function normalizeAssetName(name: string) {
  return name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

export function resolveSlipperZone(name: string) {
  const normalizedName = normalizeAssetName(name);

  return SLIPPER_MODEL_ZONES.find((zone) =>
    normalizedName.includes(SLIPPER_ZONE_TOKENS[zone]),
  );
}

function setMaterialColor(material: Material, color: string) {
  if ("color" in material && material.color instanceof Color) {
    material.color.set(color);
  }
  material.needsUpdate = true;
}

function cloneMaterialForZone(
  material: Material,
  meshZone: SlipperColorSection | undefined,
  colors: SlipperMaterialColors,
  counts: SlipperZoneCounts,
) {
  const clonedMaterial = material.clone();
  const zone = resolveSlipperZone(material.name) ?? meshZone;

  if (zone) {
    setMaterialColor(clonedMaterial, colors[zone]);
    counts[zone] += 1;
  }

  return clonedMaterial;
}

/** Clones material slots on an already-cloned scene and applies configurator colours. */
export function applySlipperMaterialColors(
  root: Object3D,
  colors: SlipperMaterialColors,
) {
  const counts: SlipperZoneCounts = {
    stripe1: 0,
    stripe2: 0,
    ankle: 0,
    sole: 0,
  };

  root.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    const meshZone = resolveSlipperZone(object.name);
    object.castShadow = true;
    object.receiveShadow = true;
    object.material = Array.isArray(object.material)
      ? object.material.map((material) =>
          cloneMaterialForZone(material, meshZone, colors, counts),
        )
      : cloneMaterialForZone(object.material, meshZone, colors, counts);
  });

  return counts;
}

export function getMissingSlipperZones(counts: SlipperZoneCounts) {
  return SLIPPER_MODEL_ZONES.filter((zone) => counts[zone] === 0);
}

export function disposeSlipperModelMaterials(root: Object3D) {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => material.dispose());
  });
}
