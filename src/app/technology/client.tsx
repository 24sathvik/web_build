"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { AudioToggle } from "@/components/dom/AudioToggle";
import { TechOverlay } from "@/components/dom/technology/TechOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";

const TechScene = dynamic(() => import("@/components/canvas/technology/TechScene"), { ssr: false });

export default function Technology() {
  const tier = useQualityTier();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden cursor-none">
      <CustomCursor />
      <AudioToggle />
      <Header />
      
      <div className="absolute inset-0 z-0">
        {tier !== "static" ? (
          <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
            <TechScene />
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
      </div>
    </main>
  );
}
