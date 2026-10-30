"use client";

import {Component, Suspense, useState, type ReactNode} from "react";
import {Canvas} from "@react-three/fiber";
import {SlipperArtwork} from "@/components/landing/SlipperArtwork";
import {SlipperModel} from "@/components/three/SlipperModel";
import type {SlipperMaterialColors} from "@/components/three/SlipperMaterials";

const CHRISTMAS_SLIPPER_COLORS: SlipperMaterialColors = {
  stripe1: "#922E3A",
  stripe2: "#F4E6CB",
  ankle: "#254936",
  sole: "#513B32",
};

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

class SlipperPreviewBoundary extends Component<
  {children: ReactNode; fallback: ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function InvitationSlipperPreview({label}: {label: string}) {
  const [webGLAvailable] = useState(supportsWebGL);
  const fallback = <div className="mx-auto w-full max-w-sm"><SlipperArtwork /></div>;

  return (
    <div className="relative mx-auto aspect-[1.05/1] w-full max-w-[34rem] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_45%,var(--snow),rgba(248,241,228,.2)_68%,transparent_70%)]" role="img" aria-label={label}>
      {!webGLAvailable ? fallback : (
        <SlipperPreviewBoundary fallback={fallback}>
          <Canvas
            aria-hidden="true"
            camera={{position: [4.4, 4.15, 5.8], fov: 34, near: 0.1, far: 50}}
            dpr={[1, 1.5]}
            frameloop="demand"
            shadows="percentage"
            fallback={fallback}
            gl={{antialias: true, alpha: true, powerPreference: "high-performance"}}
          >
            <ambientLight intensity={0.9} />
            <hemisphereLight args={["#FFF8E7", "#756458", 1.1]} />
            <directionalLight castShadow position={[4, 6, 4]} intensity={2.2} color="#FFF3D4" shadow-mapSize={[1024, 1024]} />
            <directionalLight position={[-4, 2.5, -3]} intensity={0.65} color="#D9E6DF" />
            <Suspense fallback={null}>
              <SlipperModel materials={CHRISTMAS_SLIPPER_COLORS} />
            </Suspense>
            <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[3.2, 48]} />
              <shadowMaterial color="#594438" opacity={0.18} transparent />
            </mesh>
          </Canvas>
        </SlipperPreviewBoundary>
      )}
    </div>
  );
}
