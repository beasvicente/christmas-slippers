"use client";

import { Canvas } from "@react-three/fiber";
import {
  Component,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { SlipperConfiguration } from "@/domain/slipper";

import { SlipperScene } from "./SlipperScene";
import { resolveSlipperMaterialColors } from "./SlipperMaterials";

interface SlipperViewerProps {
  colors: SlipperConfiguration["colors"];
}

interface ViewerErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class ViewerErrorBoundary extends Component<
  ViewerErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function ViewerFallback({ message }: { message: string }) {
  return (
    <div className="grid h-full min-h-72 place-items-center bg-[radial-gradient(circle_at_50%_35%,var(--snow),var(--cream))] px-8 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-gold/40 bg-snow text-2xl text-cranberry" aria-hidden="true">
          ◇
        </span>
        <p className="mt-4 font-display text-xl font-semibold text-forest">The fitting-room window is resting.</p>
        <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-foreground/60">{message}</p>
      </div>
    </div>
  );
}

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

export function SlipperViewer({ colors }: SlipperViewerProps) {
  const [webGLAvailable] = useState(supportsWebGL);
  const [resetSignal, setResetSignal] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const materials = useMemo(() => resolveSlipperMaterialColors(colors), [colors]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionQuery.matches);
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  const unavailableFallback = (
    <ViewerFallback message="This browser cannot open the interactive 3D view. Every personalisation control and the colour summary remain available below." />
  );

  return (
    <section
      className="overflow-hidden rounded-[1.75rem] border border-gold/35 bg-snow shadow-[0_20px_55px_rgba(81,59,50,0.12)]"
      aria-labelledby="slipper-viewer-title"
      aria-describedby="slipper-viewer-instructions slipper-viewer-note"
    >
      <div className="flex items-start justify-between gap-4 border-b border-gold/25 bg-snow px-5 py-4">
        <div>
          <p className="text-[9px] font-bold tracking-[0.22em] text-gold uppercase">Your colour study</p>
          <h2 id="slipper-viewer-title" className="mt-1 font-display text-2xl font-semibold text-cranberry">Slipper preview</h2>
        </div>
        <button
          type="button"
          onClick={() => setResetSignal((current) => current + 1)}
          disabled={!webGLAvailable}
          className="min-h-11 rounded-full border border-forest/25 px-3 py-2 text-[10px] font-bold tracking-[0.08em] text-forest uppercase transition-colors hover:border-cranberry hover:text-cranberry disabled:cursor-not-allowed disabled:opacity-45"
        >
          Reset view
        </button>
      </div>

      <div className="relative h-80 sm:h-96 lg:h-[22rem]">
        {!webGLAvailable ? (
          unavailableFallback
        ) : (
          <ViewerErrorBoundary fallback={unavailableFallback}>
            <Canvas
              aria-hidden="true"
              camera={{ position: [4.8, 3.6, 6.4], fov: 34, near: 0.1, far: 50 }}
              dpr={[1, 1.5]}
              frameloop="demand"
              shadows="percentage"
              fallback={unavailableFallback}
              gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            >
              <SlipperScene
                materials={materials}
                resetSignal={resetSignal}
                reducedMotion={reducedMotion}
              />
            </Canvas>
          </ViewerErrorBoundary>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-snow/80 to-transparent" aria-hidden="true" />
      </div>

      <div className="border-t border-gold/20 bg-cream/60 px-5 py-4">
        <p id="slipper-viewer-instructions" className="text-xs font-semibold text-forest">
          Drag to turn · pinch or scroll to zoom
        </p>
        <p id="slipper-viewer-note" className="mt-1 text-[11px] leading-5 text-foreground/55">
          A simple colour prototype—not the final knitted model. Mix and print yarns use their primary preview colour here.
        </p>
      </div>
    </section>
  );
}
