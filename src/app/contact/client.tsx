"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, type ReactNode } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { ContactOverlay } from "@/components/dom/contact/ContactOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";
import { debugStore } from "@/lib/debugState";

const ContactScene = dynamic(
  () =>
    import("@/components/canvas/contact/ContactScene").then((mod) => {
      debugStore.setTimeline("chunkLoaded", performance.now());
      return mod;
    }),
  { ssr: false }
);

export default function Contact({ footer }: { footer?: ReactNode }) {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/contact");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (tier !== "static") {
      import("@/components/canvas/contact/ContactScene");
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
                className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,217,255,0.18),rgba(5,5,5,1))]"
                aria-hidden="true"
              />
            }
          >
            <ContactScene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,217,255,0.18),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden" id="scroll-container-contact">
        <ContactOverlay />
        {footer}
      </div>
    </main>
  );
}
