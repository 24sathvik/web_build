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
  const [isVisible, setIsVisible] = useState(true);
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic DPR: [1, 1.5] for lite and [1, 2] for full
  const [dpr, setDpr] = useState<number>(tier === "lite" ? 1.25 : 1.75);

  useEffect(() => {
    if (tier === "lite") {
      setDpr(1.25);
    } else if (tier === "full") {
      setDpr(1.75);
    }
  }, [tier]);

  // Mount after first paint using requestIdleCallback with timeout fallback
  useEffect(() => {
    if (tier === "static") return;

    let handle: any = null;
    let isIdle = false;

    if (typeof window !== "undefined") {
      const win = window as any;
      if (typeof win.requestIdleCallback === "function") {
        isIdle = true;
        handle = win.requestIdleCallback(
          () => setMounted(true),
          { timeout: 800 }
        );
      } else {
        handle = setTimeout(() => setMounted(true), 120);
      }
    }

    return () => {
      if (typeof window !== "undefined" && handle !== null) {
        const win = window as any;
        if (isIdle && typeof win.cancelIdleCallback === "function") {
          win.cancelIdleCallback(handle);
        } else {
          clearTimeout(handle);
        }
      }
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

  // Before idle callback mounts, show fallback background so text paints first
  if (!mounted) {
    return <div ref={containerRef} className={className}>{fallbackBg}</div>;
  }

  // Frameloop is paused when hidden or offscreen
  const shouldRender = isVisible && isInView;

  return (
    <div ref={containerRef} className={className}>
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
        >
          <PerformanceMonitor
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr(tier === "lite" ? 1.5 : 2)}
          />
          {children}
        </Canvas>
      </QualityTierContext.Provider>
    </div>
  );
}
export default SceneShell;
