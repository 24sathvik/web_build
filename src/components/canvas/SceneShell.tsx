"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useQualityTier, QualityTier } from "@/hooks/useQualityTier";
import { debugStore } from "@/lib/debugState";

export const QualityTierContext = createContext<QualityTier>("full");
export const useQualityTierContext = () => useContext(QualityTierContext);

interface SceneShellProps {
  children: React.ReactNode;
  fallbackClassName?: string;
  className?: string;
  camera?: any;
  gl?: any;
  shadows?: boolean;
  triggerTime?: number | null;
}

// Requirement 1: Measure time from trigger to first rendered frame
function FirstFrameNotifier({ triggerTime }: { triggerTime?: number | null }) {
  const recorded = useRef(false);
  useFrame(() => {
    if (!recorded.current && triggerTime && triggerTime > 0) {
      recorded.current = true;
      const duration = Math.round(performance.now() - triggerTime);
      debugStore.set({ triggerToFirstFrame: duration });
    }
  });
  return null;
}

// Requirement B.4: QualitySupervisor steps the tier down live (full -> lite)
// when the average FPS stays under 40 for 2 seconds; never steps back up in the same session.
function QualitySupervisor({
  tier,
  onStepDown,
}: {
  tier: QualityTier;
  onStepDown: () => void;
}) {
  const frameCountRef = useRef(0);
  const lowFpsCountRef = useRef(0);
  const lastSecRef = useRef(performance.now());

  useFrame(() => {
    if (tier !== "full") return;

    frameCountRef.current++;
    const now = performance.now();
    const elapsed = now - lastSecRef.current;
    if (elapsed >= 1000) {
      const fps = (frameCountRef.current * 1000) / elapsed;
      frameCountRef.current = 0;
      lastSecRef.current = now;

      if (fps < 40) {
        lowFpsCountRef.current += 1;
        if (lowFpsCountRef.current >= 2) {
          onStepDown();
        }
      } else {
        lowFpsCountRef.current = 0;
      }
    }
  });

  return null;
}

export function SceneShell({
  children,
  fallbackClassName,
  className = "w-full h-full",
  camera,
  gl,
  shadows,
  triggerTime,
}: SceneShellProps) {
  const detectedTier = useQualityTier();
  const [activeTier, setActiveTier] = useState<QualityTier>(detectedTier);
  const downgradedInSession = useRef(false);

  // If triggerTime is provided from lazy trigger, mount canvas immediately.
  // Otherwise fall back to local schedule.
  const [mounted, setMounted] = useState(triggerTime ? true : false);
  const [localTriggerTime, setLocalTriggerTime] = useState<number | null>(triggerTime || null);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic DPR: [1, 1.25] for lite and [1, 1.75] for full
  const [dpr, setDpr] = useState<number>(activeTier === "lite" ? 1.25 : 1.75);

  // Synchronize tier with session downgrade state
  useEffect(() => {
    try {
      if (sessionStorage.getItem("zyxen_session_downgraded") === "true") {
        downgradedInSession.current = true;
        setActiveTier("lite");
        setDpr(1.25);
        debugStore.set({ tier: "lite", dpr: 1.25 });
        return;
      }
    } catch {}

    if (!downgradedInSession.current) {
      setActiveTier(detectedTier);
      const targetDpr = detectedTier === "lite" ? 1.25 : 1.75;
      setDpr(targetDpr);
      debugStore.set({ tier: detectedTier, dpr: targetDpr });
    }
  }, [detectedTier]);

  const handleStepDown = () => {
    if (downgradedInSession.current || activeTier !== "full") return;
    downgradedInSession.current = true;
    try {
      sessionStorage.setItem("zyxen_session_downgraded", "true");
    } catch {}
    setActiveTier("lite");
    setDpr(1.25);
    debugStore.set({ tier: "lite", dpr: 1.25 });
  };

  const handleDecline = () => {
    setDpr(1);
    debugStore.set({ dpr: 1 });
  };

  const handleIncline = () => {
    const targetDpr = activeTier === "lite" ? 1.25 : 1.75;
    setDpr(targetDpr);
    debugStore.set({ dpr: targetDpr });
  };

  useEffect(() => {
    if (triggerTime) {
      setMounted(true);
      setLocalTriggerTime(triggerTime);
      debugStore.set({ canvasMounted: true });
    }
  }, [triggerTime]);

  // Mount rule fallback when triggerTime is not externally provided:
  useEffect(() => {
    if (activeTier === "static" || mounted) return;

    let isDisposed = false;
    let cleanupListeners: (() => void) | null = null;

    const mountCanvas = () => {
      if (isDisposed) return;
      const t = performance.now();
      setLocalTriggerTime(t);
      setMounted(true);
      debugStore.set({ canvasMounted: true });
    };

    const scheduleAfterLoad = () => {
      if (isDisposed) return;

      if (activeTier === "full") {
        const win = window as any;
        let idleId: any = null;
        let timeoutId: any = null;

        if (typeof win.requestIdleCallback === "function") {
          idleId = win.requestIdleCallback(() => mountCanvas(), { timeout: 2000 });
        } else {
          timeoutId = setTimeout(() => mountCanvas(), 500);
        }

        cleanupListeners = () => {
          if (idleId && typeof win.cancelIdleCallback === "function") win.cancelIdleCallback(idleId);
          if (timeoutId) clearTimeout(timeoutId);
        };
      } else if (activeTier === "lite") {
        const win = window as any;
        let idleId: any = null;
        let timeoutId: any = null;
        let triggered = false;

        const events = ["pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

        const onInteraction = () => {
          if (triggered || isDisposed) return;
          triggered = true;
          cleanup();
          mountCanvas();
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

        // 5000 ms idle post-load fallback
        timeoutId = setTimeout(() => {
          if (triggered || isDisposed) return;
          if (typeof win.requestIdleCallback === "function") {
            idleId = win.requestIdleCallback(() => {
              if (!triggered && !isDisposed) {
                triggered = true;
                cleanup();
                mountCanvas();
              }
            });
          } else {
            triggered = true;
            cleanup();
            mountCanvas();
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
  }, [activeTier, mounted]);

  // Pause rendering when document is hidden
  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Pause rendering when scene is off-screen
  useEffect(() => {
    if (!mounted || !containerRef.current || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  // CSS Gradient fallback background for "static" or pre-mount
  const fallbackBg = (
    <div
      className={
        fallbackClassName ||
        "w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
      }
      aria-hidden="true"
    />
  );

  // For static tier, do not render canvas at all
  if (activeTier === "static") {
    return <div ref={containerRef} className={className}>{fallbackBg}</div>;
  }

  // Frameloop is paused when hidden or offscreen
  const shouldRender = isVisible && isInView;

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Background gradient: always present underneath so text paints first and canvas fades in */}
      <div className="absolute inset-0 z-0">
        {fallbackBg}
      </div>

      {/* Canvas container: mounts lazily and fades in once ready */}
      {mounted && (
        <div
          className={`relative z-10 w-full h-full transition-opacity duration-700 ease-out ${
            canvasVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <QualityTierContext.Provider value={activeTier}>
            <Canvas
              camera={camera}
              shadows={shadows}
              gl={{
                powerPreference: "high-performance",
                antialias: false,
                stencil: false,
                depth: true,
                ...gl,
              }}
              dpr={dpr}
              frameloop={shouldRender ? "always" : "never"}
              onCreated={() => {
                requestAnimationFrame(() => setCanvasVisible(true));
              }}
            >
              <PerformanceMonitor onDecline={handleDecline} onIncline={handleIncline} />
              <QualitySupervisor tier={activeTier} onStepDown={handleStepDown} />
              <FirstFrameNotifier triggerTime={localTriggerTime} />
              {children}
            </Canvas>
          </QualityTierContext.Provider>
        </div>
      )}
    </div>
  );
}

export default SceneShell;
