"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

import { SLIPPER_MODEL_ASSET } from "./SlipperModelAsset";
import {
  applySlipperMaterialColors,
  disposeSlipperModelMaterials,
  getMissingSlipperZones,
} from "./SlipperModelMapping";
import type { SlipperMaterialColors } from "./SlipperMaterials";

interface SlipperModelProps {
  materials: SlipperMaterialColors;
}

export function SlipperModel({ materials }: SlipperModelProps) {
  const gltf = useGLTF(SLIPPER_MODEL_ASSET.url);
  const model = useMemo(() => {
    const instance = clone(gltf.scene);
    const zoneCounts = applySlipperMaterialColors(instance, materials);
    const missingZones = getMissingSlipperZones(zoneCounts);

    if (missingZones.length > 0) {
      disposeSlipperModelMaterials(instance);
      throw new Error(
        `The slipper GLB is missing colour zones: ${missingZones.join(", ")}`,
      );
    }

    return instance;
  }, [gltf.scene, materials]);

  useEffect(
    () => () => disposeSlipperModelMaterials(model),
    [model],
  );

  return (
    <primitive
      object={model}
      position={SLIPPER_MODEL_ASSET.position}
      rotation={SLIPPER_MODEL_ASSET.rotation}
      scale={SLIPPER_MODEL_ASSET.scale}
      dispose={null}
    />
  );
}
