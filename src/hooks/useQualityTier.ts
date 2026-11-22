"use client";

import { useEffect, useState } from "react";
import { getNetworkConnection, getDeviceMemoryGB } from "@/lib/browser-compat";

export type QualityTier = "full" | "lite" | "static";

let cachedTier: QualityTier | null = null;

export function detectQualityTier(): QualityTier {
  if (typeof window === "undefined") return "static";
  if (cachedTier) return cachedTier;

  // 0. Check URL query override for testing: ?tier=static|lite|full
  try {
    const params = new URLSearchParams(window.location.search);
    const urlTier = params.get("tier");
    if (urlTier === "static" || urlTier === "lite" || urlTier === "full") {
      cachedTier = urlTier;
      return urlTier;
    }
  } catch {
    // Ignore if URLSearchParams is unavailable
  }

  // 1. Check "static" conditions (skip on Save-Data and slow 2g/3g connections)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = getNetworkConnection();
  const saveData = connection.saveData;
  const isSlowNetwork =
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g" ||
    connection.effectiveType === "3g";

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

  if (prefersReducedMotion || !hasWebGL || saveData || isSlowNetwork) {
    cachedTier = "static";
    return "static";
  }

  // 2. Check "lite" conditions
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isMobileViewport = window.innerWidth < 768;
  const deviceMemory = getDeviceMemoryGB();
  const lowMemory = deviceMemory <= 4;
  const lowConcurrency =
    typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;

  if (isCoarsePointer || isMobileViewport || lowMemory || lowConcurrency) {
    cachedTier = "lite";
    return "lite";
  }

  // 3. "full" for high-performance desktop devices
  cachedTier = "full";
  return "full";
}

export function useQualityTier(): QualityTier {
  const [tier, setTier] = useState<QualityTier>(() => detectQualityTier());

  useEffect(() => {
    const detected = detectQualityTier();
    if (tier !== detected) {
      setTier(detected);
    }
  }, [tier]);

  return tier;
}
