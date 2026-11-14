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
    if (tier === "static") {
      setShouldMount(false);
      return;
    }

    let isDisposed = false;
    let cleanupListeners: (() => void) | null = null;

    const fireTrigger = () => {
      if (hasTriggered.current || isDisposed) return;
      hasTriggered.current = true;
      const t = performance.now();
      setTriggerTime(t);
      setShouldMount(true);
      debugStore.set({ canvasMounted: true });
    };

    // Requirement 4: Never prefetch on Save-Data or slow connections (2g, slow-2g, 3g)
    const isConnectionSlowOrSaveData = () => {
      const conn = getNetworkConnection();
      if (conn.saveData) return true;
      const eff = conn.effectiveType;
      return eff === "2g" || eff === "slow-2g" || eff === "3g";
    };

    // Requirement 3 & 4: Fetch static /chunks-manifest.json (pure static build, zero server runtime)
    const prefetchChunks = () => {
      if (isConnectionSlowOrSaveData()) return;

      try {
        fetch("/chunks-manifest.json")
          .then((r) => r.json())
          .then((data) => {
            if (isDisposed || !data || !Array.isArray(data[routePath])) return;
            const files: string[] = data[routePath];
            files.forEach((file: string) => {
              const fullHref = `/_next/${file}`;
              if (!document.querySelector(`link[href="${fullHref}"]`)) {
                const link = document.createElement("link");
                link.rel = "prefetch";
                link.as = "script";
                link.href = fullHref;
                document.head.appendChild(link);
              }
            });
          })
          .catch(() => {});
      } catch {}
    };

    const scheduleAfterLoad = () => {
      if (isDisposed || hasTriggered.current) return;

      if (tier === "full") {
        let idleId: number | null = null;
        let timeoutId: any = null;
        const events = ["pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

        const onInteraction = (e: Event) => {
          if (hasTriggered.current || isDisposed) return;
          if (e.type === "scroll" && window.scrollY === 0) return;
          cleanup();
          fireTrigger();
        };

        const cleanup = () => {
          events.forEach((evt) => {
            window.removeEventListener(evt, onInteraction, { capture: true } as any);
          });
          if (idleId !== null) safeCancelIdleCallback(idleId);
          if (timeoutId) clearTimeout(timeoutId);
        };

        cleanupListeners = cleanup;

        events.forEach((evt) => {
          window.addEventListener(evt, onInteraction, { once: true, passive: true, capture: true });
        });

        // Fallback: trigger after 4500ms on idle if no user interaction occurred
        timeoutId = setTimeout(() => {
          if (hasTriggered.current || isDisposed) return;
          idleId = safeRequestIdleCallback(() => {
            if (!hasTriggered.current && !isDisposed) {
              cleanup();
              fireTrigger();
            }
          }, { timeout: 1500 });
        }, 4500);
      } else if (tier === "lite") {
        // Requirement 4: Start prefetch only after "load" event PLUS an additional 2000 ms idle
        let prefetchTimer: any = setTimeout(() => {
          if (isDisposed || hasTriggered.current) return;
          safeRequestIdleCallback(() => prefetchChunks(), { timeout: 8000 });
        }, 2000);

        let idleId: number | null = null;
        let timeoutId: any = null;
        const events = ["pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

        const onInteraction = (e: Event) => {
          if (hasTriggered.current || isDisposed) return;
          if (e.type === "scroll" && window.scrollY === 0) return;
          cleanup();
          fireTrigger();
        };

        const cleanup = () => {
          events.forEach((evt) => {
            window.removeEventListener(evt, onInteraction, { capture: true } as any);
          });
          if (prefetchTimer) clearTimeout(prefetchTimer);
          if (idleId !== null) safeCancelIdleCallback(idleId);
          if (timeoutId) clearTimeout(timeoutId);
        };

        cleanupListeners = cleanup;

        events.forEach((evt) => {
          window.addEventListener(evt, onInteraction, { once: true, passive: true, capture: true });
        });

        // 5000 ms idle post-load fallback: wait 5000ms, then trigger on idle
        timeoutId = setTimeout(() => {
          if (hasTriggered.current || isDisposed) return;
          idleId = safeRequestIdleCallback(() => {
            if (!hasTriggered.current && !isDisposed) {
              cleanup();
              fireTrigger();
            }
          });
        }, 5000);
      }
    };

    let loadHandler: (() => void) | null = null;
    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        scheduleAfterLoad();
      } else {
        loadHandler = () => scheduleAfterLoad();
        window.addEventListener("load", loadHandler, { once: true });
      }
    }

    return () => {
      isDisposed = true;
      if (loadHandler) window.removeEventListener("load", loadHandler);
      if (cleanupListeners) cleanupListeners();
    };
  }, [tier, routePath]);

  return { shouldMount, triggerTime };
}
