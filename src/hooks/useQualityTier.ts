"use client";

import { useEffect, useState } from "react";

export type QualityTier = "full" | "lite" | "static";

export function useQualityTier(): QualityTier {
  // SSR-safe: default to "static" so server render and initial paint show text first without canvas blocking
  const [tier, setTier] = useState<QualityTier>("static");

  useEffect(() => {
    // 0. Check URL query override for testing: ?tier=static|lite|full
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTier = params.get("tier");
      if (urlTier === "static" || urlTier === "lite" || urlTier === "full") {
        setTier(urlTier);
        return;
      }
    } catch {
      // Ignore if URLSearchParams is unavailable
    }

    // 1. Check "static" conditions
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    const saveData = nav.connection?.saveData === true;

    let hasWebGL = false;
    try {
      const canvas = document.createElement("canvas");
      hasWebGL = Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext("webgl2") ||
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl"))
      );
    } catch {
      hasWebGL = false;
    }

    if (prefersReducedMotion || !hasWebGL || saveData) {
      setTier("static");
      return;
    }

    // 2. Check "lite" conditions
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isMobileViewport = window.innerWidth < 768;
    const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
    const lowConcurrency =
      typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;

    if (isCoarsePointer || isMobileViewport || lowMemory || lowConcurrency) {
      setTier("lite");
      return;
    }

    // 3. "full" for high-performance desktop devices
    setTier("full");
  }, []);

  return tier;
}
