import { memo } from "react";

import type { SlipperMaterialColors } from "./SlipperMaterials";

interface SlipperModelProps {
  materials: SlipperMaterialColors;
  position: [number, number, number];
  rotationY: number;
}

const BODY_COLOR = "#E9DFCC";
const OPENING_COLOR = "#3F3934";

export const SlipperModel = memo(function SlipperModel({
  materials,
  position,
  rotationY,
}: SlipperModelProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.19, 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[0.92, 1, 0.25]}>
        <capsuleGeometry args={[0.61, 1.72, 6, 20]} />
        <meshStandardMaterial color={materials.sole} roughness={0.82} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.52, 0.21]} scale={[0.78, 0.43, 1.38]}>
        <sphereGeometry args={[0.86, 28, 18]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.95} />
      </mesh>

      <mesh castShadow position={[0, 0.79, 0.57]} scale={[0.77, 0.14, 0.24]}>
        <sphereGeometry args={[0.86, 24, 12]} />
        <meshStandardMaterial color={materials.stripe1} roughness={0.9} />
      </mesh>

      <mesh castShadow position={[0, 0.82, 0.13]} scale={[0.74, 0.14, 0.23]}>
        <sphereGeometry args={[0.86, 24, 12]} />
        <meshStandardMaterial color={materials.stripe2} roughness={0.9} />
      </mesh>

      <mesh castShadow position={[0, 0.79, -0.58]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.28, 1]}>
        <torusGeometry args={[0.38, 0.13, 14, 36]} />
        <meshStandardMaterial color={materials.ankle} roughness={0.92} />
      </mesh>

      <mesh position={[0, 0.785, -0.58]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.78, 1.02, 1]}>
        <circleGeometry args={[0.38, 36]} />
        <meshStandardMaterial color={OPENING_COLOR} roughness={1} />
      </mesh>
    </group>
  );
});
