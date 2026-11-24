"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Overlay } from "@/components/dom/Overlay";
import { Header } from "@/components/dom/Header";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";
import { debugStore } from "@/lib/debugState";

// Dynamically import the Canvas to prevent SSR issues with Three.js
const Scene = dynamic(
  () =>
    import("@/components/canvas/Scene").then((mod) => {
      debugStore.setTimeline("chunkLoaded", performance.now());
      return mod;
    }),
  { ssr: false }
);

export default function Home() {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/");

  useEffect(() => {
    // Scroll to top on load and prevent browser scroll restoration from jumping
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      const scroller = document.getElementById("scroll-container");
      if (scroller) {
        scroller.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }
    // Start fetching 3D chunk immediately upon hydration
    if (tier !== "static") {
      import("@/components/canvas/Scene");
    }
  }, [tier]);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden cursor-none">
      <CustomCursor />
      <Header />

      {/* 3D WebGL Background: gated by tier so static tier never downloads the 3D bundle */}
      <div className="absolute inset-0 z-0">
        {shouldMount ? (
          <Suspense
            fallback={
              <div
                className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
                aria-hidden="true"
              />
            }
          >
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
        <SiteFooter />
      </div>
    </main>
  );
}
