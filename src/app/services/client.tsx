"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { AudioToggle } from "@/components/dom/AudioToggle";
import { ServicesOverlay } from "@/components/dom/services/ServicesOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";

const ServicesScene = dynamic(() => import("@/components/canvas/services/ServicesScene"), { ssr: false });

export default function Services() {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/services");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden cursor-none">
      <CustomCursor />
      <AudioToggle />
      <Header />
      
      <div className="absolute inset-0 z-0">
        {shouldMount ? (
          <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
            <ServicesScene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden" id="scroll-container-services">
        <ServicesOverlay />
      </div>
    </main>
  );
}
