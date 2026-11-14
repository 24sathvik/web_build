"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, type ReactNode } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { ProjectsOverlay } from "@/components/dom/projects/ProjectsOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";

import { useSelectionStore, projectStore } from "@/lib/sceneSync";
import type { ProjectItem } from "@/content/site";

const ProjectsScene = dynamic(() => import("@/components/canvas/projects/ProjectsScene"), { ssr: false });

export default function Projects({
  projects = [],
  footer,
}: {
  projects?: ProjectItem[];
  footer?: ReactNode;
}) {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/projects");
  const { hoveredId, activeId } = useSelectionStore(projectStore);
  const previewId = hoveredId || activeId;
  const previewProject = previewId
    ? projects.find((p) => p.id === previewId)
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
            <ProjectsScene triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Subtle status chip when user hovers/taps a 3D gallery panel */}
      {previewProject && tier !== "static" && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-30 rounded-full border border-white/15 bg-[#05060d]/90 px-4 py-2 text-xs font-mono text-white shadow-lg flex items-center gap-3 pointer-events-auto"
        >
          <span
            className={`font-bold uppercase tracking-wider ${
              previewProject.id === "raise-lab-equipment"
                ? "text-[#00FFB2]"
                : previewProject.group === "aviation"
                  ? "text-[#00D9FF]"
                  : "text-[#6E5BFF]"
            }`}
          >
            {previewProject.badge}
          </span>
          <span className="text-white/90">{previewProject.name}</span>
          <a
            href={`#${previewProject.id}`}
            className="text-[#00D9FF] hover:underline min-h-[44px] inline-flex items-center"
          >
            View &darr;
          </a>
        </div>
      )}

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
