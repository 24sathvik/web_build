"use client";

import type { ProjectItem } from "@/content/site";

export function OrbitControlsDock({
  currentIndex,
  totalProjects,
  currentProject,
  onPrev,
  onNext,
  onOpenDrawer,
}: {
  currentIndex: number;
  totalProjects: number;
  currentProject: ProjectItem | null;
  onPrev: () => void;
  onNext: () => void;
  onOpenDrawer: (project: ProjectItem) => void;
}) {
  const formattedIndex = String(currentIndex + 1).padStart(2, "0");
  const formattedTotal = String(totalProjects).padStart(2, "0");
  const progressPercent = totalProjects > 0 ? ((currentIndex + 1) / totalProjects) * 100 : 0;

  return (
    <div
      role="region"
      aria-label="3D Orbit Navigation Controls"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[95vw]"
    >
      <div className="flex items-center gap-2 sm:gap-4 rounded-full border border-white/[0.15] bg-[#05060d]/[0.88] backdrop-blur-none md:backdrop-blur-xl px-3 sm:px-5 py-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.6)]">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          aria-label="Previous project in orbit"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Counter & Progress Bar */}
        <div className="flex flex-col items-center px-1 sm:px-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-widest">
              {formattedIndex} / {formattedTotal}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={totalProjects}
            aria-label="Orbit gallery position"
            className="w-16 sm:w-28 h-1.5 rounded-full bg-white/10 overflow-hidden"
          >
            <div
              className="h-full bg-gradient-to-r from-[#00D9FF] to-[#6E5BFF] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          aria-label="Next project in orbit"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Active Project Info & Details Trigger */}
        {currentProject && (
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/15">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                currentProject.group === "aviation"
                  ? "text-[#00D9FF] border-[#00D9FF]/40 bg-[#00D9FF]/10"
                  : "text-[#A78BFA] border-[#6E5BFF]/40 bg-[#6E5BFF]/10"
              }`}
            >
              {currentProject.badge}
            </span>
            <span className="text-xs font-mono text-white/90 max-w-[130px] truncate">
              {currentProject.name}
            </span>
            <button
              onClick={() => onOpenDrawer(currentProject)}
              className="min-h-[36px] inline-flex items-center text-xs font-mono text-[#00D9FF] hover:underline px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
            >
              Details &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
