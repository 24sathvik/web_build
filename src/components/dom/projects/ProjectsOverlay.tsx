"use client";

import { useRef } from "react";
import Link from "next/link";
import type { ProjectItem } from "@/content/site";
import { projectStore, useSelectionStore } from "@/lib/sceneSync";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";

function ProjectPlaceholder({ project }: { project: ProjectItem }) {
  const isAviation = project.group === "aviation";
  const badgeColor = isAviation ? "text-[#00D9FF]" : "text-emerald-400";

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/10 bg-[#080a10]/90 p-4 md:p-6 shadow-2xl overflow-hidden font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
          <span className="ml-3 text-xs font-mono text-white/40 hidden sm:inline-block">
            zyxen.in/systems/{project.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400/90 font-bold">
            SYSTEM ACTIVE
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/5">
          <div>
            <p className="text-[10px] font-mono text-white/40 uppercase">SYSTEM ARCHITECTURE</p>
            <p className="text-sm font-bold text-white">{project.name}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 font-bold ${badgeColor}`}>
            {project.badge}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
          {project.features.slice(0, 3).map((feat, i) => (
            <div key={feat} className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40">MODULE 0{i + 1}</p>
              <p className="font-bold mt-0.5 text-white/90 truncate">{feat}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] font-mono text-white/40 pt-1 border-t border-white/5">
          {project.tagline}
        </p>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  idx,
  isHighlighted,
}: {
  project: ProjectItem;
  idx: number;
  isHighlighted: boolean;
}) {
  const isEven = idx % 2 === 0;
  const isAviation = project.group === "aviation";
  const ringClass = isAviation
    ? "ring-2 ring-[#00D9FF]/70 bg-[#00D9FF]/[0.03] shadow-[0_0_32px_rgba(0,217,255,0.12)]"
    : "ring-2 ring-[#6E5BFF]/80 bg-[#6E5BFF]/[0.04] shadow-[0_0_32px_rgba(110,91,255,0.14)]";

  return (
    <section
      id={project.id}
      onMouseEnter={() => projectStore.set({ domHoveredId: project.id })}
      onMouseLeave={() => projectStore.set({ domHoveredId: null })}
      onFocus={() => projectStore.set({ domHoveredId: project.id })}
      onBlur={() => projectStore.set({ domHoveredId: null })}
      className="projects-section content-visibility-auto w-full min-h-[100svh] flex items-center justify-center px-6 md:px-16 lg:px-24 py-16"
    >
      <div
        className={`max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-3xl p-4 md:p-6 transition-all duration-300 ${
          isEven ? "" : "lg:[&>*:first-child]:order-2"
        } ${isHighlighted ? ringClass : ""}`}
      >
        {/* Left Column: Project Info */}
        <div className="lg:col-span-5 pointer-events-auto">
          <span
            className={`inline-block text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border mb-4 ${
              isAviation
                ? "bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF]"
                : "bg-[#6E5BFF]/10 border-[#6E5BFF]/30 text-[#6E5BFF]"
            }`}
          >
            {project.badge}
          </span>
          <h3 className="reveal-text text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {project.name}
          </h3>
          <p className="reveal-text text-[#BFC7D5] text-base md:text-lg leading-relaxed mb-6">
            {project.tagline}
          </p>
          <div className="reveal-text flex flex-wrap gap-2 mb-6">
            {project.features.map((feat) => (
              <span
                key={feat}
                className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 text-white/80 border border-white/10"
              >
                {feat}
              </span>
            ))}
          </div>
          {project.id === "exam-portals" && (
            <p className="reveal-text text-xs text-white/50 border-t border-white/10 pt-3 italic mb-6">
              Configured to follow the exam pattern and rules of DGCA (India), FAA (USA), EASA (Europe), and other authorities on request.
            </p>
          )}
          <div className="reveal-text pt-2">
            <Link
              href={isAviation ? "/aviation-academy-software" : (project.href || "/contact")}
              className="inline-flex min-h-[44px] items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 transition-colors shadow-md"
            >
              <span>{isAviation ? "View Aviation Module" : "Inquire About System"}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Styled Placeholder Mockup */}
        <div className="lg:col-span-7 pointer-events-auto">
          <ProjectPlaceholder project={project} />
        </div>
      </div>
    </section>
  );
}

export function ProjectsOverlay({
  projects = [],
}: {
  projects?: ProjectItem[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { hoveredId, activeId } = useSelectionStore(projectStore);
  const highlightedProjectId = hoveredId || activeId;

  const aviationProjects = projects.filter((p) => p.group === "aviation");
  const businessProjects = projects.filter((p) => p.group === "business");

  return (
    <div id="overlay-container-projects" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      {/* Intro Header Section with Single H1 */}
      <section className="projects-section w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="hero-entrance pointer-events-auto mb-6">
          <Breadcrumbs items={[{ label: "Projects" }]} />
        </div>
        <p className="hero-entrance text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-4 pointer-events-auto">
          Portfolio &amp; Selected Systems
        </p>
        <h1 className="hero-entrance-delay text-[clamp(2.5rem,6vw,5.5rem)] font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto leading-tight">
          SYSTEMS &amp; SITES.
        </h1>
        <p className="hero-entrance-delay text-base md:text-xl text-[#BFC7D5] max-w-2xl font-light pointer-events-auto leading-relaxed mb-8">
          Specialized software and high-performance websites engineered for aviation training academies, growing manufacturers, and modern service businesses.
        </p>
        <div className="hero-entrance-delay-2 flex flex-wrap gap-4 justify-center pointer-events-auto">
          <a
            href="#aviation-systems"
            className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono uppercase tracking-wider text-white transition-colors"
          >
            Aviation Systems ({aviationProjects.length}) &darr;
          </a>
          <a
            href="#business-systems"
            className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono uppercase tracking-wider text-white transition-colors"
          >
            Business Systems ({businessProjects.length}) &darr;
          </a>
        </div>
      </section>

      {/* GROUP 1: Aviation Academies & Institutes */}
      <section id="aviation-systems" className="projects-section content-visibility-auto w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="reveal-text text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF] px-3 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 mb-4 pointer-events-auto">
          Group 01 &bull; Aviation &amp; Academies
        </span>
        <h2 className="reveal-text text-3xl md:text-5xl font-bold text-white mb-4 pointer-events-auto">
          For Aviation Academies and Institutes
        </h2>
        <p className="reveal-text text-[#BFC7D5] max-w-xl text-base md:text-lg pointer-events-auto">
          Dedicated testing engines, fee management, student pipelines, and multi-branch operations.
        </p>
      </section>

      {/* Aviation Projects List */}
      {aviationProjects.map((project, idx) => (
        <ProjectCard
          key={project.id}
          project={project}
          idx={idx}
          isHighlighted={highlightedProjectId === project.id}
        />
      ))}

      {/* GROUP 2: Businesses */}
      <section id="business-systems" className="projects-section content-visibility-auto w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="reveal-text text-xs font-mono uppercase tracking-[0.25em] text-[#6E5BFF] px-3 py-1 rounded-full bg-[#6E5BFF]/10 border border-[#6E5BFF]/30 mb-4 pointer-events-auto">
          Group 02 &bull; Enterprise &amp; SMEs
        </span>
        <h2 className="reveal-text text-3xl md:text-5xl font-bold text-white mb-4 pointer-events-auto">
          For Businesses
        </h2>
        <p className="reveal-text text-[#BFC7D5] max-w-xl text-base md:text-lg pointer-events-auto">
          Operations software, task execution, invoicing systems, batch tracking, and interactive web presences.
        </p>
      </section>

      {/* Business Projects List */}
      {businessProjects.map((project, idx) => (
        <ProjectCard
          key={project.id}
          project={project}
          idx={idx}
          isHighlighted={highlightedProjectId === project.id}
        />
      ))}

      {/* CTA Section */}
      <section className="projects-section content-visibility-auto w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24">
        <h2 className="reveal-text text-4xl md:text-6xl font-bold text-white mb-6 pointer-events-auto">
          Need a Custom Platform?
        </h2>
        <p className="reveal-text text-[#BFC7D5] max-w-xl text-base md:text-lg mb-8 pointer-events-auto">
          Tell us about your organization's operational workflows, student examination patterns, or internal processes.
        </p>
        <div className="reveal-text pointer-events-auto">
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors shadow-xl"
          >
            Start a Project with ZYXEN &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
