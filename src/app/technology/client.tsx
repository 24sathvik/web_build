"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, type ReactNode } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { TechOverlay } from "@/components/dom/technology/TechOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";

const TechScene = dynamic(() => import("@/components/canvas/technology/TechScene"), { ssr: false });

export default function Technology({ footer }: { footer?: ReactNode }) {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/technology");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden cursor-none">
      <CustomCursor />
      <Header />
      
      <div className="absolute inset-0 z-0">
        {shouldMount ? (
          <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
            <TechScene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden" id="scroll-container-tech">
        <TechOverlay />
        {footer}
      </div>
    </main>
  );
}
