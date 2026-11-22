"use client";

import { useState, useEffect, useRef } from "react";
import { QualityTier } from "./useQualityTier";
import { debugStore } from "@/lib/debugState";
import chunksManifest from "@/lib/chunks-manifest.json";
import {
  getNetworkConnection,
  safeRequestIdleCallback,
  safeCancelIdleCallback,
} from "@/lib/browser-compat";

export function useLazySceneTrigger(tier: QualityTier, routePath: string) {
  const [shouldMount, setShouldMount] = useState(tier !== "static");
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

    // Start fetching 3D chunk right after hydration (no artificial delay; skip on Save-Data/2g/3g)
    const prefetchChunks = () => {
      if (isConnectionSlowOrSaveData()) return;

      try {
        const manifest = chunksManifest as Record<string, string[]>;
        const files = manifest[routePath];
        if (Array.isArray(files)) {
          files.forEach((file: string) => {
            const fullHref = `/_next/${file}`;
            if (!document.querySelector(`link[href="${fullHref}"]`)) {
              const link = document.createElement("link");
              link.rel = "preload";
              link.as = "script";
              link.href = fullHref;
              document.head.appendChild(link);
            }
          });
        }
      } catch {}
    };

    // Fetch chunk immediately upon hydration
    prefetchChunks();

    // Mount right after hydration and first paint (two requestAnimationFrames or requestIdleCallback with 150ms timeout)
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        fireTrigger();
      });
    });

    idleId = safeRequestIdleCallback(
      () => {
        fireTrigger();
      },
      { timeout: 150 }
    );

    return () => {
      isDisposed = true;
      if (raf1 !== null) cancelAnimationFrame(raf1);
      if (raf2 !== null) cancelAnimationFrame(raf2);
      if (idleId !== null) safeCancelIdleCallback(idleId);
    };
  }, [tier, routePath]);

  return { shouldMount, triggerTime };
}
