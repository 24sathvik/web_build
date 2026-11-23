"use client";

import { useRef, useState, useEffect, useCallback, Fragment, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { ProjectItem } from "@/content/site";
import { projectStore, useSelectionStore } from "@/lib/sceneSync";

// Client-only dynamic imports to keep initial static route JS transfer strictly <= 250 KB
const ProjectDetailDrawer = dynamic(
  () => import("./ProjectDetailDrawer").then((mod) => mod.ProjectDetailDrawer),
  { ssr: false }
);

const OrbitControlsDock = dynamic(
  () => import("./OrbitControlsDock").then((mod) => mod.OrbitControlsDock),
  { ssr: false }
);

type FilterType = "all" | "aviation" | "business";

function SectionHeadingPanel({
  id,
  badgeText,
  badgeClass,
  title,
  subtitle,
  borderHoverClass,
}: {
  id: string;
  badgeText: string;
  badgeClass: string;
  title: string;
  subtitle: string;
  borderHoverClass: string;
}) {
  return (
    <section
      id={id}
      className="projects-section relative w-full min-h-[45vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(5,6,13,0.85)_0%,rgba(5,6,13,0.45)_65%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className={`relative group max-w-3xl w-full rounded-2xl md:rounded-3xl p-[1px] transition-all duration-300 pointer-events-auto bg-gradient-to-b from-white/15 to-white/5 ${borderHoverClass}`}
      >
        <div className="w-full rounded-[15px] md:rounded-[23px] bg-[#05060d]/[0.72] backdrop-blur-none md:backdrop-blur-xl p-8 sm:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] flex flex-col items-center">
          <span className={`text-xs font-mono uppercase tracking-[0.25em] px-3.5 py-1 rounded-full mb-4 ${badgeClass}`}>
            {badgeText}
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-[#D8DFEC] max-w-xl text-base sm:text-lg">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

function ProjectPlaceholder({ project }: { project: ProjectItem }) {
  const isAv = project.group === "aviation";
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#080a12]/[0.85] p-4 md:p-6 shadow-2xl font-sans backdrop-blur-none md:backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 text-xs font-mono text-white/50 hidden sm:inline">
            zyxen.in/systems/{project.id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-bold">
            SYSTEM ACTIVE
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-white/[0.04] p-3 rounded-xl border border-white/10">
          <div>
            <p className="text-[10px] font-mono text-white/60 uppercase">SYSTEM ARCHITECTURE</p>
            <p className="text-sm font-bold text-white">{project.name}</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/10 font-bold ${isAv ? "text-[#00D9FF]" : "text-emerald-400"}`}>
            {project.badge}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
          {project.features.slice(0, 3).map((feat, i) => (
            <div key={feat} className="bg-white/[0.03] p-2 rounded-xl border border-white/10">
              <p className="text-[10px] text-white/60">MODULE 0{i + 1}</p>
              <p className="font-bold mt-0.5 text-white truncate">{feat}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-mono text-white/70 pt-1 border-t border-white/10 truncate">
          {project.tagline}
        </p>
      </div>
    </div>
  );
}

const BASE_BORDER_GRAD = "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))";

function ProjectCard({
  project,
  idx,
  total,
  isHighlighted,
  onOpenDrawer,
}: {
  project: ProjectItem;
  idx: number;
  total: number;
  isHighlighted: boolean;
  onOpenDrawer: (project: ProjectItem) => void;
}) {
  const isEven = idx % 2 === 0;
  const isAviation = project.group === "aviation";
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, visible: false });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
  };

  const accentColor = isAviation
    ? "rgba(0, 217, 255, 0.5)"
    : project.id === "pharma-quotation-system"
      ? "rgba(0, 255, 178, 0.5)"
      : "rgba(167, 139, 250, 0.5)";

  const accentBadgeClass = isAviation
    ? "bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF]"
    : project.id === "pharma-quotation-system"
      ? "bg-[#00FFB2]/10 border-[#00FFB2]/30 text-[#00FFB2]"
      : "bg-[#6E5BFF]/10 border-[#6E5BFF]/30 text-[#A78BFA]";

  const spotlightColor = isAviation
    ? "rgba(0, 217, 255, 0.14)"
    : project.id === "pharma-quotation-system"
      ? "rgba(0, 255, 178, 0.14)"
      : "rgba(167, 139, 250, 0.14)";

  return (
    <section
      id={project.id}
      data-project-card="true"
      data-project-group={project.group}
      className="projects-section relative w-full min-h-[100svh] flex items-center justify-center px-4 sm:px-6 md:px-16 lg:px-24 py-16"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(5,6,13,0.85)_0%,rgba(5,6,13,0.45)_65%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => projectStore.set({ domHoveredId: project.id })}
        onMouseLeave={() => {
          setSpotlight((prev) => ({ ...prev, visible: false }));
          projectStore.set({ domHoveredId: null });
        }}
        className="relative group max-w-6xl w-full rounded-2xl md:rounded-3xl p-[1px] transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.985] active:brightness-95 pointer-events-auto"
        style={{
          background: isHighlighted
            ? `linear-gradient(135deg, ${accentColor}, rgba(255, 255, 255, 0.25), ${accentColor})`
            : BASE_BORDER_GRAD,
        }}
      >
        <div
          className="pointer-events-none absolute -inset-[1px] rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
          style={{ background: `linear-gradient(135deg, ${accentColor}, rgba(255, 255, 255, 0.15), ${accentColor})` }}
          aria-hidden="true"
        />
        <div
          className={`relative w-full rounded-[15px] md:rounded-[23px] bg-[#05060d]/[0.72] backdrop-blur-none md:backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] ${
            isHighlighted ? (isAviation ? "shadow-[0_0_36px_rgba(0,217,255,0.2)]" : "shadow-[0_0_36px_rgba(110,91,255,0.2)]") : ""
          }`}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[15px] md:rounded-[23px] transition-opacity duration-200"
            style={{
              opacity: spotlight.visible ? 1 : 0,
              background: `radial-gradient(450px circle at ${spotlight.x}px ${spotlight.y}px, ${spotlightColor}, transparent 70%)`,
            }}
            aria-hidden="true"
          />
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${isEven ? "" : "lg:[&>*:first-child]:order-2"}`}>
            <div className="lg:col-span-5 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-block text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${accentBadgeClass}`}>
                  {project.badge}
                </span>
                <span className="text-xs font-mono text-white/50">
                  {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
                {project.name}
              </h3>
              <p className="text-[#D8DFEC] text-base leading-relaxed mb-6 font-normal">
                {project.tagline}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.features.map((feat) => (
                  <span key={feat} className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 text-white/90 border border-white/10">
                    {feat}
                  </span>
                ))}
              </div>
              {project.id === "exam-portals" && (
                <p className="text-xs text-white/70 border-t border-white/10 pt-3 italic mb-6">
                  Configured to follow the exam pattern and rules of DGCA (India), FAA (USA), EASA (Europe), and other authorities on request.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={isAviation ? "/aviation-academy-software" : (project.href || "/contact")}
                  className="inline-flex min-h-[44px] items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
                >
                  <span>{isAviation ? "View Aviation Module" : "Inquire About System"}</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <button
                  type="button"
                  onClick={() => onOpenDrawer(project)}
                  aria-haspopup="dialog"
                  aria-expanded="false"
                  className="inline-flex min-h-[44px] items-center gap-2 text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
                >
                  <span>System Details</span>
                  <span aria-hidden="true">&rsaquo;</span>
                </button>
              </div>
            </div>
            <div className="lg:col-span-7 relative z-10">
              <ProjectPlaceholder project={project} />
            </div>
          </div>
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
  const [filter, setFilter] = useState<FilterType>("all");
  const [drawerProject, setDrawerProject] = useState<ProjectItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { hoveredId, activeId, domHoveredId } = useSelectionStore(projectStore);
  const currentHighlightId = domHoveredId || hoveredId || activeId;

  useEffect(() => {
    if (currentHighlightId) {
      const idx = projects.findIndex((p) => p.id === currentHighlightId);
      if (idx >= 0 && idx !== selectedIndex) setSelectedIndex(idx);
    }
  }, [currentHighlightId, projects, selectedIndex]);

  const filteredProjects = projects.filter((p) => {
    if (filter === "aviation") return p.group === "aviation";
    if (filter === "business") return p.group === "business";
    return true;
  });

  const aviationCount = projects.filter((p) => p.group === "aviation").length;
  const businessCount = projects.filter((p) => p.group === "business").length;
  const activeProject = projects[selectedIndex] || projects[0] || null;

  const navigateToProject = useCallback(
    (targetProject: ProjectItem) => {
      const targetIdx = projects.findIndex((p) => p.id === targetProject.id);
      if (targetIdx >= 0) setSelectedIndex(targetIdx);
      const currentNonce = projectStore.get().focusNonce;
      projectStore.set({
        activeId: targetProject.id,
        domHoveredId: targetProject.id,
        focusNonce: currentNonce + 1,
      });
      const el = document.getElementById(targetProject.id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [projects]
  );

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    const matches = projects.filter((p) => {
      if (newFilter === "aviation") return p.group === "aviation";
      if (newFilter === "business") return p.group === "business";
      return true;
    });
    const firstMatch = matches[0];
    if (firstMatch) navigateToProject(firstMatch);
  };

  const handlePrev = useCallback(() => {
    if (projects.length === 0) return;
    const nextIdx = (selectedIndex - 1 + projects.length) % projects.length;
    navigateToProject(projects[nextIdx]);
  }, [selectedIndex, projects, navigateToProject]);

  const handleNext = useCallback(() => {
    if (projects.length === 0) return;
    const nextIdx = (selectedIndex + 1) % projects.length;
    navigateToProject(projects[nextIdx]);
  }, [selectedIndex, projects, navigateToProject]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable || isDrawerOpen) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, isDrawerOpen]);

  const openDrawer = (project: ProjectItem) => {
    setDrawerProject(project);
    setIsDrawerOpen(true);
  };

  return (
    <div id="overlay-container-projects" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      <section className="projects-section relative w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4 py-20">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(5,6,13,0.85)_0%,rgba(5,6,13,0.45)_65%,transparent_100%)]"
          aria-hidden="true"
        />
        <div className="relative group max-w-4xl w-full rounded-2xl md:rounded-3xl p-[1px] transition-all duration-300 pointer-events-auto bg-gradient-to-b from-white/15 to-white/5 hover:from-white/25 hover:to-white/10">
          <div className="w-full rounded-[15px] md:rounded-[23px] bg-[#05060d]/[0.72] backdrop-blur-none md:backdrop-blur-xl p-8 sm:p-12 md:p-14 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] flex flex-col items-center">
            {/* Inline accessible breadcrumbs */}
            <nav aria-label="Breadcrumb" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#BFC7D5] mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-white/40">/</span>
              <span className="text-white">Projects</span>
            </nav>
            <p className="text-xs sm:text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-4">
              Portfolio &amp; Selected Systems
            </p>
            <h1 className="text-[clamp(2.25rem,5.5vw,5rem)] font-bold tracking-tighter text-[#FFFFFF] mb-6 leading-tight">
              SYSTEMS &amp; SITES.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#D8DFEC] max-w-2xl font-light leading-relaxed mb-8">
              Specialized software and high-performance websites engineered for aviation training academies, growing manufacturers, and modern service businesses.
            </p>
            <div role="tablist" aria-label="Filter project categories" className="flex flex-wrap gap-2.5 sm:gap-3 justify-center mb-6">
              <button
                type="button"
                role="tab"
                aria-selected={filter === "all"}
                onClick={() => handleFilterChange("all")}
                className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] ${
                  filter === "all" ? "bg-white text-black font-bold shadow-lg" : "bg-white/5 text-white/80 border border-white/15 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>All</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === "all" ? "bg-black/10 text-black" : "bg-white/10 text-white/70"}`}>
                  {projects.length}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === "aviation"}
                onClick={() => handleFilterChange("aviation")}
                className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] ${
                  filter === "aviation" ? "bg-[#00D9FF] text-black font-bold shadow-[0_0_24px_rgba(0,217,255,0.4)]" : "bg-white/5 text-white/80 border border-white/15 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>For aviation academies</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === "aviation" ? "bg-black/10 text-black" : "bg-white/10 text-white/70"}`}>
                  {aviationCount}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === "business"}
                onClick={() => handleFilterChange("business")}
                className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] ${
                  filter === "business" ? "bg-[#6E5BFF] text-white font-bold shadow-[0_0_24px_rgba(110,91,255,0.4)]" : "bg-white/5 text-white/80 border border-white/15 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>For businesses</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === "business" ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}>
                  {businessCount}
                </span>
              </button>
            </div>
            <div className="flex flex-wrap gap-3 justify-center text-xs font-mono">
              <a href="#aviation-systems" className="min-h-[40px] inline-flex items-center px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors">
                Aviation Systems ({aviationCount}) &darr;
              </a>
              <a href="#business-systems" className="min-h-[40px] inline-flex items-center px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors">
                Business Systems ({businessCount}) &darr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Render grouped sections and cards */}
      {filteredProjects.map((project, idx) => {
        const isFirstAviation = project.group === "aviation" && (idx === 0 || filteredProjects[idx - 1]?.group !== "aviation");
        const isFirstBusiness = project.group === "business" && (idx === 0 || filteredProjects[idx - 1]?.group !== "business");

        return (
          <Fragment key={project.id}>
            {isFirstAviation && (
              <SectionHeadingPanel
                id="aviation-systems"
                badgeText="Group 01 • Aviation & Academies"
                badgeClass="text-[#00D9FF] bg-[#00D9FF]/10 border border-[#00D9FF]/30"
                title="For Aviation Academies and Institutes"
                subtitle="Dedicated testing engines, fee management, student pipelines, and multi-branch operations."
                borderHoverClass="hover:from-[#00D9FF]/40 hover:to-white/10"
              />
            )}
            {isFirstBusiness && (
              <SectionHeadingPanel
                id="business-systems"
                badgeText="Group 02 • Enterprise & SMEs"
                badgeClass="text-[#A78BFA] bg-[#6E5BFF]/10 border border-[#6E5BFF]/30"
                title="For Businesses"
                subtitle="Operations software, task execution, invoicing systems, batch tracking, and interactive web presences."
                borderHoverClass="hover:from-[#6E5BFF]/40 hover:to-white/10"
              />
            )}
            <ProjectCard
              project={project}
              idx={idx}
              total={filteredProjects.length}
              isHighlighted={currentHighlightId === project.id}
              onOpenDrawer={openDrawer}
            />
          </Fragment>
        );
      })}

      <section className="projects-section relative w-full min-h-[55vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(5,6,13,0.85)_0%,rgba(5,6,13,0.45)_65%,transparent_100%)]"
          aria-hidden="true"
        />
        <div className="relative group max-w-3xl w-full rounded-2xl md:rounded-3xl p-[1px] transition-all duration-300 pointer-events-auto bg-gradient-to-b from-white/15 to-white/5 hover:from-[#00D9FF]/40 hover:to-[#6E5BFF]/40">
          <div className="w-full rounded-[15px] md:rounded-[23px] bg-[#05060d]/[0.72] backdrop-blur-none md:backdrop-blur-xl p-8 sm:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.6)] flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Need a Custom Platform?
            </h2>
            <p className="text-[#D8DFEC] max-w-xl text-base sm:text-lg mb-8 leading-relaxed">
              Tell us about your organization's operational workflows, student examination patterns, or internal processes.
            </p>
            <div>
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
              >
                <span>Start a Project with ZYXEN</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <OrbitControlsDock
        currentIndex={selectedIndex}
        totalProjects={projects.length}
        currentProject={activeProject}
        onPrev={handlePrev}
        onNext={handleNext}
        onOpenDrawer={openDrawer}
      />

      <ProjectDetailDrawer
        project={drawerProject}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
