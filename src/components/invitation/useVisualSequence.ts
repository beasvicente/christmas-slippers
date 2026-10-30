"use client";

import {useEffect, useRef, useState} from "react";

interface VisualSequenceStep<Phase extends string> {
  phase: Phase;
  durationMs: number;
}

export function useVisualSequence<Phase extends string>({
  initialPhase,
  steps,
  onComplete,
}: {
  initialPhase: Phase;
  steps: readonly VisualSequenceStep<Phase>[];
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);
  const completed = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  function clearTimer() {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
  }

  function finish() {
    if (completed.current) return;
    completed.current = true;
    clearTimer();
    onCompleteRef.current();
  }

  function showStep(index: number) {
    const step = steps[index];
    if (!step) {
      finish();
      return;
    }

    setPhase(step.phase);
    timer.current = setTimeout(() => showStep(index + 1), step.durationMs);
  }

  function activate() {
    if (completed.current) return;
    if (running.current) {
      finish();
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    running.current = true;
    showStep(0);
  }

  useEffect(() => clearTimer, []);

  return {phase, activate};
}
