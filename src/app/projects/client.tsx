"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, type ReactNode } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { ProjectsOverlay } from "@/components/dom/projects/ProjectsOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";
import { debugStore } from "@/lib/debugState";
import type { ProjectItem } from "@/content/site";

const ProjectsScene = dynamic(
  () =>
    import("@/components/canvas/projects/ProjectsScene").then((mod) => {
      debugStore.setTimeline("chunkLoaded", performance.now());
      return mod;
    }),
  { ssr: false }
);

const FALLBACK_BG = (
  <div
    className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
    aria-hidden="true"
  />
);

export default function Projects({
  projects = [],
  footer,
}: {
  projects?: ProjectItem[];
  footer?: ReactNode;
}) {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/projects");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (tier !== "static") {
      import("@/components/canvas/projects/ProjectsScene");
    }
  }, [tier]);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden cursor-none">
      <CustomCursor />
      <Header />

      {/* 3D Background Canvas Layer */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {shouldMount ? (
          <Suspense fallback={FALLBACK_BG}>
            <ProjectsScene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          FALLBACK_BG
        )}
      </div>

      {/* Ambient background gradient scrim so 3D never clashes with text */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#050505]/75 via-[#050505]/45 to-[#050505]/80"
        aria-hidden="true"
      />

      {/* Scrollable DOM Content Container */}
      <div
        className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden touch-pan-y"
        id="scroll-container-projects"
      >
        <ProjectsOverlay projects={projects} />
        {footer}
      </div>
    </main>
  );
}
