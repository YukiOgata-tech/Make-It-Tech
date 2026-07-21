"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Run before paint on the client (avoids a scale flash), but fall back to
// useEffect during SSR so React doesn't warn.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Fits a fixed-size "sheet" to the available width by uniformly scaling it with
 * `transform: scale()` (no reflow -> the layout never breaks). The sheet's
 * natural width is read from its computed style, so this works regardless of the
 * root font-size or whether the sheet is sized in px or rem. Never upscales past
 * 1:1. The returned `scale` is meant to feed a `--fit-scale` CSS variable; print
 * styles override that variable, so PDF output is unaffected.
 */
export function useFitScale() {
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(1);

  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    if (!stage || !sheet) return;

    const update = () => {
      const naturalWidth = parseFloat(getComputedStyle(sheet).width) || 1;
      setScale(Math.min(1, stage.clientWidth / naturalWidth));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return { stageRef, sheetRef, scale };
}
