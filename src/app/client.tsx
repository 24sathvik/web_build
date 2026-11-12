"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, type ReactNode } from "react";
import { Overlay } from "@/components/dom/Overlay";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";

// Dynamically import the Canvas to prevent SSR issues with Three.js
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
});

export default function Home({ footer }: { footer?: ReactNode }) {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/");

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden cursor-none">
      <CustomCursor />
      <Header />
      
      {/* 3D WebGL Background: gated by tier so static tier never downloads the 3D bundle */}
      <div className="absolute inset-0 z-0">
        {shouldMount ? (
          <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
            <Scene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      {/* DOM Overlay for Scroll and UI */}
      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden" id="scroll-container">
        <Overlay />
        {footer}
      </div>
    </main>
  );
}
