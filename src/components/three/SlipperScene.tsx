import { Html, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { SlipperModel } from "./SlipperModel";
import type { SlipperMaterialColors } from "./SlipperMaterials";

interface SlipperSceneProps {
  materials: SlipperMaterialColors;
  resetSignal: number;
  reducedMotion: boolean;
}

const CAMERA_POSITION = [4.4, 4.2, 5.7] as const;
const CAMERA_TARGET = [0, 0.1, 0] as const;

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

    camera.position.set(...CAMERA_POSITION);
    controlsRef.current.target.set(...CAMERA_TARGET);
    controlsRef.current.update();
    invalidate();
  }, [camera, invalidate, resetSignal]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={CAMERA_TARGET}
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

function ModelLoading() {
  return (
    <Html center>
      <p className="whitespace-nowrap rounded-full bg-snow/90 px-4 py-2 text-xs font-semibold text-forest shadow-sm">
        Unwrapping the slippers…
      </p>
    </Html>
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
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#FFF8E7", "#756458", 1.15]} />
      <directionalLight
        castShadow
        position={[4, 6, 4]}
        intensity={2.15}
        color="#FFF3D4"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.035}
      />
      <directionalLight position={[-4, 2.5, -3]} intensity={0.65} color="#D9E6DF" />

      <Suspense fallback={<ModelLoading />}>
        <SlipperModel materials={materials} />
      </Suspense>

      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 48]} />
        <shadowMaterial color="#594438" opacity={0.2} transparent />
      </mesh>
      <CameraControls resetSignal={resetSignal} reducedMotion={reducedMotion} />
    </>
  );
}
