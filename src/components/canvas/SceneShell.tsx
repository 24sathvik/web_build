"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useQualityTier, QualityTier } from "@/hooks/useQualityTier";

export const QualityTierContext = createContext<QualityTier>("full");
export const useQualityTierContext = () => useContext(QualityTierContext);

interface SceneShellProps {
  children: React.ReactNode;
  fallbackClassName?: string;
  className?: string;
  camera?: any;
  gl?: any;
  shadows?: boolean;
}

export function SceneShell({
  children,
  fallbackClassName,
  className = "w-full h-full",
  camera,
  gl,
  shadows,
}: SceneShellProps) {
  const tier = useQualityTier();
  const [mounted, setMounted] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic DPR: [1, 1.25] for lite and [1, 1.75] for full
  const [dpr, setDpr] = useState<number>(tier === "lite" ? 1.25 : 1.75);

  useEffect(() => {
    if (tier === "lite") {
      setDpr(1.25);
    } else if (tier === "full") {
      setDpr(1.75);
    }
  }, [tier]);

  // Mount rule:
  // 1. Wait for window "load" AND React hydration to finish.
  // 2. full tier: mount via requestIdleCallback with a 2000 ms timeout.
  // 3. lite tier: mount on the first pointerdown, touchstart, wheel, scroll or keydown,
  //    OR after 5000 ms of idle post-load, whichever comes first.
  // 4. Until then show the CSS gradient. Fade canvas in when ready.
  useEffect(() => {
    if (tier === "static") return;

    let isDisposed = false;
    let cleanupListeners: (() => void) | null = null;

    const mountCanvas = () => {
      if (isDisposed) return;
      setMounted(true);
    };

    const scheduleAfterLoad = () => {
      if (isDisposed) return;

      if (tier === "full") {
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
      } else if (tier === "lite") {
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

        // 5000 ms idle post-load fallback: wait 5000ms, then mount on idle
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
  }, [tier]);

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
  if (tier === "static") {
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
          <QualityTierContext.Provider value={tier}>
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
              <PerformanceMonitor
                onDecline={() => setDpr(1)}
                onIncline={() => setDpr(tier === "lite" ? 1.5 : 2)}
              />
              {children}
            </Canvas>
          </QualityTierContext.Provider>
        </div>
      )}
    </div>
  );
}
export default SceneShell;
