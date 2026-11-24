"use client";

import { useState, useEffect, useRef } from "react";
import { QualityTier } from "./useQualityTier";
import { debugStore } from "@/lib/debugState";
import {
  getNetworkConnection,
  safeRequestIdleCallback,
  safeCancelIdleCallback,
} from "@/lib/browser-compat";

export function useLazySceneTrigger(tier: QualityTier, routePath: string) {
  const [shouldMount, setShouldMount] = useState(false);
  const [triggerTime, setTriggerTime] = useState<number | null>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Record hydrationEnd on mount
    debugStore.setTimeline("hydrationEnd", performance.now());

    // Static tier is unchanged: no 3D scene, no chunk
    if (tier === "static") {
      setShouldMount(false);
      return;
    }
    setShouldMount(true);

    let isDisposed = false;
    let raf1: number | null = null;
    let raf2: number | null = null;
    let idleId: number | null = null;

    const fireTrigger = () => {
      if (hasTriggered.current || isDisposed) return;
      hasTriggered.current = true;
      const t = performance.now();
      setTriggerTime(t);
      setShouldMount(true);
      debugStore.set({ canvasMounted: true });
      debugStore.setTimeline("mountTrigger", t);
    };

    // Never prefetch on Save-Data or slow connections (2g, slow-2g, 3g)
    const isConnectionSlowOrSaveData = () => {
      const conn = getNetworkConnection();
      if (conn.saveData) return true;
      const eff = conn.effectiveType;
      return eff === "2g" || eff === "slow-2g" || eff === "3g";
    };

    // Dynamic chunk fetching is triggered natively by client.tsx on mount
    const prefetchChunks = () => {
      // Native dynamic import() in client.tsx handles chunk fetching without 404 hash drift
    };

    // Fetch chunk immediately upon hydration
    prefetchChunks();

    // Mount right after hydration and first paint
    raf1 = requestAnimationFrame(() => {
      fireTrigger();
    });

    idleId = safeRequestIdleCallback(
      () => {
        fireTrigger();
      },
      { timeout: 80 }
    );

    return () => {
      isDisposed = true;
      if (raf1 !== null) cancelAnimationFrame(raf1);
      if (idleId !== null) safeCancelIdleCallback(idleId);
    };
  }, [tier, routePath]);

  return { shouldMount, triggerTime };
}
