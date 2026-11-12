"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, type ReactNode } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { AviationOverlay } from "@/components/dom/aviation/AviationOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";

import { useSelectionStore, aviationStore } from "@/lib/sceneSync";
import { siteContent } from "@/content/site";

const AviationScene = dynamic(() => import("@/components/canvas/aviation/AviationScene"), { ssr: false });

export default function AviationClient({ footer }: { footer?: ReactNode }) {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/aviation-academy-software");
  const { hoveredCode, selectedCode } = useSelectionStore(aviationStore);
  const chipCode = hoveredCode || selectedCode;
  const activeAuthority = chipCode
    ? siteContent.aviation.authorities.find((a) => a.code === chipCode)
    : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden cursor-none">
      <CustomCursor />
      <Header />

      <div className="absolute inset-0 z-0" aria-hidden="true">
        {shouldMount ? (
          <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
            <AviationScene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Floating DOM label chip anchored dynamically to active 3D globe node */}
      {activeAuthority && tier !== "static" && (
        <div
          id="aviation-globe-chip"
          role="status"
          aria-live="polite"
          className="fixed left-0 top-0 z-30 w-64 max-w-[85vw] rounded-xl border border-[#00D9FF]/50 bg-[#05060d]/92 px-3.5 py-2.5 text-left shadow-[0_0_24px_rgba(0,217,255,0.22)] pointer-events-auto"
          style={{ transform: "translate3d(50vw, 40vh, 0) translate(-50%, -100%)" }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#00D9FF]">
              {activeAuthority.code} &bull; {activeAuthority.region}
            </span>
            {selectedCode && (
              <button
                type="button"
                aria-label="Close authority preview"
                onClick={() => aviationStore.set({ selectedCode: null, hoveredCode: null })}
                className="text-xs text-white/60 hover:text-white px-1.5 py-0.5 rounded"
              >
                &times;
              </button>
            )}
          </div>
          <p className="text-xs font-semibold text-white leading-snug">{activeAuthority.name}</p>
          <p className="mt-1 text-[11px] text-[#BFC7D5] leading-snug">
            {activeAuthority.timerPassing}. {activeAuthority.negativeMarking}.
          </p>
          <a
            href={`#authority-${activeAuthority.code.toLowerCase()}`}
            className="mt-1.5 inline-block text-[11px] font-mono text-[#00D9FF] hover:underline"
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
        {footer}
      </div>
    </main>
  );
}
