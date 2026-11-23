"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Header } from "@/components/dom/Header";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { AviationOverlay } from "@/components/dom/aviation/AviationOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";
import { debugStore } from "@/lib/debugState";

import { useSelectionStore, aviationStore } from "@/lib/sceneSync";
import { siteContent } from "@/content/site";

const AviationScene = dynamic(
  () =>
    import("@/components/canvas/aviation/AviationScene").then((mod) => {
      debugStore.setTimeline("chunkLoaded", performance.now());
      return mod;
    }),
  { ssr: false }
);

export default function AviationClient() {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/aviation-academy-software");
  const { hoveredCode, selectedCode } = useSelectionStore(aviationStore);
  const chipCode = hoveredCode || selectedCode;
  const activeAuthority = chipCode
    ? siteContent.aviation.authorities.find((a) => a.code === chipCode)
    : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (tier !== "static") {
      import("@/components/canvas/aviation/AviationScene");
    }
  }, [tier]);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden cursor-none">
      <CustomCursor />
      <Header />

      {/* 3D WebGL Background: fixed behind everything with inset 0 (100svh and 100% width) */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {shouldMount ? (
          <Suspense
            fallback={
              <div
                className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,217,255,0.18),rgba(5,5,5,1))]"
                aria-hidden="true"
              />
            }
          >
            <AviationScene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,217,255,0.18),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Left-side gradient scrim: keeps hero and overlay text readable across all viewports */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-r from-[#050505]/95 via-[#050505]/75 to-transparent md:w-[62%] w-full"
        aria-hidden="true"
      />

      {/* Phone scrim: dims the 110% wide centered globe behind text */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] md:hidden bg-[#050505]/45"
        aria-hidden="true"
      />

      {/* Dynamic SVG connecting line between active 3D globe node and the floating UI chip */}
      <svg
        id="aviation-chip-svg"
        className="pointer-events-none fixed inset-0 z-25 w-full h-full"
        style={{ display: "none" }}
        aria-hidden="true"
      >
        <line
          id="aviation-chip-line"
          x1="0"
          y1="0"
          x2="0"
          y2="0"
          stroke="#00D9FF"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeOpacity="0.85"
        />
        <circle id="aviation-chip-origin-dot" cx="0" cy="0" r="3.5" fill="#00D9FF" />
      </svg>

      {/* Floating DOM label chip anchored dynamically to active 3D globe node */}
      {activeAuthority && tier !== "static" && (
        <div
          id="aviation-globe-chip"
          role="status"
          aria-live="polite"
          className="fixed left-0 top-0 z-30 w-72 max-w-[88vw] rounded-xl border border-[#00D9FF]/60 bg-[#05060d]/95 p-3.5 text-left shadow-[0_0_30px_rgba(0,217,255,0.25)] backdrop-blur-xl pointer-events-auto"
          style={{ transform: "translate3d(-9999px, -9999px, 0)" }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold text-[#00D9FF]">
              {activeAuthority.code} &bull; {activeAuthority.region}
            </span>
            {selectedCode && (
              <button
                type="button"
                aria-label="Close authority preview"
                onClick={() => aviationStore.set({ selectedCode: null, hoveredCode: null })}
                className="text-sm text-white/60 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded -mr-2 -my-2"
              >
                &times;
              </button>
            )}
          </div>
          <p className="text-xs font-semibold text-white leading-snug">{activeAuthority.name}</p>
          <p className="mt-1.5 text-[11px] text-[#BFC7D5] leading-snug">
            {activeAuthority.timerPassing}. {activeAuthority.negativeMarking}.
          </p>
          <a
            href={`#authority-${activeAuthority.code.toLowerCase()}`}
            className="mt-2 inline-flex min-h-[44px] items-center text-[11px] font-mono text-[#00D9FF] hover:underline"
          >
            Jump to rules &darr;
          </a>
        </div>
      )}

      <div
        className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden touch-pan-y"
        id="scroll-container-aviation"
      >
        <AviationOverlay />
        <SiteFooter />
      </div>
    </main>
  );
}
