"use client";

import { useState, useEffect, useRef } from "react";
import { QualityTier } from "./useQualityTier";
import { debugStore } from "@/lib/debugState";

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

    const prefetchChunks = () => {
      try {
        fetch(`/api/chunks?route=${encodeURIComponent(routePath)}`)
          .then((r) => r.json())
          .then((data) => {
            if (isDisposed || !data?.files || !Array.isArray(data.files)) return;
            data.files.forEach((file: string) => {
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

      const win = window as any;

      if (tier === "full") {
        let idleId: any = null;
        let timeoutId: any = null;

        if (typeof win.requestIdleCallback === "function") {
          idleId = win.requestIdleCallback(() => fireTrigger(), { timeout: 2000 });
        } else {
          timeoutId = setTimeout(() => fireTrigger(), 500);
        }

        cleanupListeners = () => {
          if (idleId && typeof win.cancelIdleCallback === "function") win.cancelIdleCallback(idleId);
          if (timeoutId) clearTimeout(timeoutId);
        };
      } else if (tier === "lite") {
        // Pre-fetch 3D chunk during idle after load (no execution)
        if (typeof win.requestIdleCallback === "function") {
          win.requestIdleCallback(() => prefetchChunks(), { timeout: 3000 });
        } else {
          setTimeout(() => prefetchChunks(), 1000);
        }

        let idleId: any = null;
        let timeoutId: any = null;
        const events = ["pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

        const onInteraction = () => {
          if (hasTriggered.current || isDisposed) return;
          cleanup();
          fireTrigger();
        };

        const cleanup = () => {
          events.forEach((evt) => {
            window.removeEventListener(evt, onInteraction, { capture: true } as any);
          });
          if (idleId && typeof win.cancelIdleCallback === "function") win.cancelIdleCallback(idleId);
          if (timeoutId) clearTimeout(timeoutId);
        };

        cleanupListeners = cleanup;

        events.forEach((evt) => {
          window.addEventListener(evt, onInteraction, { once: true, passive: true, capture: true });
        });

        // 5000 ms idle post-load fallback: wait 5000ms, then trigger on idle
        timeoutId = setTimeout(() => {
          if (hasTriggered.current || isDisposed) return;
          if (typeof win.requestIdleCallback === "function") {
            idleId = win.requestIdleCallback(() => {
              if (!hasTriggered.current && !isDisposed) {
                cleanup();
                fireTrigger();
              }
            });
          } else {
            cleanup();
            fireTrigger();
          }
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
