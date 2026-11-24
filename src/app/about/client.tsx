"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Header } from "@/components/dom/Header";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { AboutOverlay } from "@/components/dom/about/AboutOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";
import { debugStore } from "@/lib/debugState";

const AboutScene = dynamic(
  () =>
    import("@/components/canvas/about/AboutScene").then((mod) => {
      debugStore.setTimeline("chunkLoaded", performance.now());
      return mod;
    }),
  { ssr: false }
);

export default function About() {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/about");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      const scroller = document.getElementById("scroll-container-about");
      if (scroller) {
        scroller.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }
    if (tier !== "static") {
      import("@/components/canvas/about/AboutScene");
    }
  }, [tier]);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden cursor-none">
      <CustomCursor />
      <Header />

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
            <AboutScene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden" id="scroll-container-about">
        <AboutOverlay />
        <SiteFooter />
      </div>
    </main>
  );
}
