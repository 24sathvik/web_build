"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Header } from "@/components/dom/Header";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { ServicesOverlay } from "@/components/dom/services/ServicesOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";
import { debugStore } from "@/lib/debugState";

const ServicesScene = dynamic(
  () =>
    import("@/components/canvas/services/ServicesScene").then((mod) => {
      debugStore.setTimeline("chunkLoaded", performance.now());
      return mod;
    }),
  { ssr: false }
);

export default function Services() {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/services");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (tier !== "static") {
      import("@/components/canvas/services/ServicesScene");
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
                className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,217,255,0.15),rgba(5,5,5,1))]"
                aria-hidden="true"
              />
            }
          >
            <ServicesScene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,217,255,0.15),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden" id="scroll-container-services">
        <ServicesOverlay />
        <SiteFooter />
      </div>
    </main>
  );
}
