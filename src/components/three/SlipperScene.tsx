import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { SlipperModel } from "./SlipperModel";
import type { SlipperMaterialColors } from "./SlipperMaterials";

interface SlipperSceneProps {
  materials: SlipperMaterialColors;
  resetSignal: number;
  reducedMotion: boolean;
}

function CameraControls({
  resetSignal,
  reducedMotion,
}: Pick<SlipperSceneProps, "resetSignal" | "reducedMotion">) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate } = useThree();

  useEffect(() => {
    if (resetSignal === 0 || !controlsRef.current) {
      return;
    }

    camera.position.set(4.8, 3.6, 6.4);
    controlsRef.current.target.set(0, 0.52, 0);
    controlsRef.current.update();
    invalidate();
  }, [camera, invalidate, resetSignal]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0.52, 0]}
      enablePan={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      minDistance={4.4}
      maxDistance={8.2}
      minPolarAngle={0.55}
      maxPolarAngle={1.42}
      rotateSpeed={0.72}
      zoomSpeed={0.75}
      makeDefault
    />
  );
}

export function SlipperScene({
  materials,
  resetSignal,
  reducedMotion,
}: SlipperSceneProps) {
  return (
    <>
      <color attach="background" args={["#FFF9EE"]} />
      <ambientLight intensity={1.35} />
      <hemisphereLight args={["#FFF8E7", "#7A6757", 1.4]} />
      <directionalLight
        castShadow
        position={[4, 6, 4]}
        intensity={2.6}
        color="#FFF3D4"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.035}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#D9E6DF" />

      <group position={[0, -0.58, 0]} rotation={[0, -0.08, 0]}>
        <SlipperModel materials={materials} position={[-0.82, 0, 0.12]} rotationY={-0.1} />
        <SlipperModel materials={materials} position={[0.82, 0, -0.12]} rotationY={0.1} />
      </group>

      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 48]} />
        <shadowMaterial color="#594438" opacity={0.2} transparent />
      </mesh>
      <CameraControls resetSignal={resetSignal} reducedMotion={reducedMotion} />
    </>
  );
}
