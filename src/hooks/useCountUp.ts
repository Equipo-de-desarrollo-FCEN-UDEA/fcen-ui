import { useEffect, useState } from "react";

const COUNT_UP_DURATION_MS = 700;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export function useCountUp(target: number): number {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    let frame = 0;
    const reduced = prefersReducedMotion();
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = reduced ? 1 : Math.min(1, (now - startedAt) / COUNT_UP_DURATION_MS);
      setValue(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}
