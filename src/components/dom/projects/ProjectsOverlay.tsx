"use client";

import { useRef } from "react";
import Link from "next/link";
import { siteContent, ProjectItem } from "@/content/site";
import { projectStore, useSelectionStore } from "@/lib/sceneSync";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";

function ProjectPlaceholder({ project }: { project: ProjectItem }) {
  return (
    <div className="w-full glass-panel rounded-2xl border border-white/10 bg-[#080a10]/90 p-4 md:p-6 shadow-2xl overflow-hidden font-sans">
      {/* Mock Browser/App Header */}
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

      {/* Domain-specific Styled Interface Mockup */}
      {project.id === "exam-portals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/5">
            <div>
              <p className="text-xs font-mono text-white/50">AUTHORITY SYLLABUS MAPPING</p>
              <p className="text-sm font-bold text-white">DGCA / FAA Pilot Ground Exam</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-[#00D9FF]">TIMER ACTIVE</p>
              <p className="text-sm font-mono font-bold text-[#00D9FF]">01:45:22</p>
            </div>
          </div>
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 space-y-3">
            <p className="text-xs text-white/60 font-mono">Q.14 Navigation &amp; Meteorology (Configurable Negative Marking)</p>
            <p className="text-sm text-white/90">
              Calculate magnetic track given true track 045°, variation 5°W, drift 8°P.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {["A) 058° M", "B) 050° M", "C) 042° M", "D) 037° M"].map((opt, i) => (
                <div
                  key={opt}
                  className={`text-xs p-2 rounded-lg border font-mono ${
                    i === 1
                      ? "border-[#00D9FF]/50 bg-[#00D9FF]/10 text-white"
                      : "border-white/5 bg-white/[0.02] text-white/60"
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-white/40 pt-1">
            <span>20 Questions &bull; Pass Mark: 70%</span>
            <span className="text-emerald-400">Instant Performance Analytics</span>
          </div>
        </div>
      )}

      {project.id === "finance-fee" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
              <p className="text-[10px] font-mono text-white/40">FEE COLLECTED</p>
              <p className="text-base font-mono font-bold text-emerald-400">₹42,80,000</p>
            </div>
            <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
              <p className="text-[10px] font-mono text-white/40">PENDING DUES</p>
              <p className="text-base font-mono font-bold text-[#FFB300]">₹6,40,000</p>
            </div>
            <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
              <p className="text-[10px] font-mono text-white/40">GST INVOICES</p>
              <p className="text-base font-mono font-bold text-white">128 Issued</p>
            </div>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden text-xs">
            <div className="grid grid-cols-4 p-2.5 bg-white/[0.03] text-white/40 font-mono text-[11px] border-b border-white/5">
              <span>CADET / STUDENT</span>
              <span>BATCH</span>
              <span>AMOUNT</span>
              <span className="text-right">STATUS</span>
            </div>
            {[
              { id: "C-2026-081", batch: "CPL Ground 26A", amt: "₹1,85,000", status: "PAID", stCol: "text-emerald-400" },
              { id: "C-2026-094", batch: "ATPL Theory", amt: "₹95,000", status: "PENDING", stCol: "text-[#FFB300]" },
              { id: "C-2026-102", batch: "Simulator Phase", amt: "₹2,40,000", status: "PAID", stCol: "text-emerald-400" },
            ].map((row) => (
              <div key={row.id} className="grid grid-cols-4 p-2.5 border-b border-white/[0.03] text-white/80 font-mono items-center">
                <span>{row.id}</span>
                <span className="text-white/60">{row.batch}</span>
                <span>{row.amt}</span>
                <span className={`text-right font-bold ${row.stCol}`}>{row.status}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-mono text-white/40">Full Ledger &bull; Quotations &bull; Automated Payment Receipts</p>
        </div>
      )}

      {project.id === "admissions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { stage: "Enquiry", count: "48", col: "text-[#00D9FF]" },
              { stage: "Screening", count: "19", col: "text-[#6E5BFF]" },
              { stage: "Aptitude Test", count: "8", col: "text-[#FFB300]" },
              { stage: "Enrolled", count: "24", col: "text-emerald-400" },
            ].map((st) => (
              <div key={st.stage} className="bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                <p className="text-[10px] font-mono text-white/50 truncate">{st.stage}</p>
                <p className={`text-lg font-bold font-mono ${st.col}`}>{st.count}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-white/80 font-bold">Inbound Application Pipeline</span>
              <span className="text-[11px] text-emerald-400 font-mono">Conversion: 38%</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#00D9FF] h-full w-[45%]" />
              <div className="bg-[#6E5BFF] h-full w-[25%]" />
              <div className="bg-[#FFB300] h-full w-[15%]" />
              <div className="bg-emerald-400 h-full w-[15%]" />
            </div>
            <p className="text-[11px] text-white/40 font-mono pt-1">
              Document uploads, eligibility verification, and automated admission notifications.
            </p>
          </div>
        </div>
      )}

      {project.id === "erp-platform" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/5">
            <div>
              <p className="text-[10px] font-mono text-white/40">CENTRAL ERP</p>
              <p className="text-sm font-bold text-white">Multi-Unit Academy Operations</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white">Branch 01</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-white/50">Branch 02</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-1">
              <p className="text-[10px] font-mono text-[#00D9FF]">RESOURCE ALLOCATION</p>
              <p className="font-mono text-white/90">Ground Classrooms: 100%</p>
              <p className="font-mono text-white/60">Simulators: 3 Active</p>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-1">
              <p className="text-[10px] font-mono text-[#6E5BFF]">STAFF &amp; ROLES</p>
              <p className="font-mono text-white/90">Chief Ground Instructor</p>
              <p className="font-mono text-white/60">Fee Accountant &bull; Admin</p>
            </div>
          </div>
          <p className="text-[11px] font-mono text-white/40">
            Real-time synchronization across flight training centres and corporate offices.
          </p>
        </div>
      )}

      {project.id === "raise-lab-equipment" && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-mono text-white/40">ENQUIRY &amp; QUOTATION DESK</p>
              <p className="text-xs font-mono font-bold text-white">Pharmaceutical Lab Equipment</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00D9FF]/15 text-[#00D9FF] font-bold">
              RFQ FLOW
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40">PORTAL</p>
              <p className="text-white/90 font-bold">Company Website</p>
              <p className="text-[10px] text-white/40 mt-1">Product Catalog</p>
            </div>
            <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40">WORKFLOW</p>
              <p className="text-emerald-400 font-bold">Quote Builder</p>
              <p className="text-[10px] text-white/40 mt-1">Structured Enquiries</p>
            </div>
          </div>
          <p className="text-[11px] font-mono text-white/40">Company Website &bull; Product Enquiries &bull; Quotation System</p>
        </div>
      )}

      {project.id === "zyops" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/5">
            <span className="text-xs font-mono font-bold text-[#00FF9D]">OPERATIONS HUB</span>
            <span className="text-[10px] font-mono text-white/50">Active Sprints: 6</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] font-mono text-white/40">QUOTES</p>
              <p className="text-sm font-mono font-bold text-white">14 Open</p>
            </div>
            <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] font-mono text-white/40">WIP BOARD</p>
              <p className="text-sm font-mono font-bold text-[#00D9FF]">9 Live</p>
            </div>
            <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] font-mono text-white/40">ACCOUNTS</p>
              <p className="text-sm font-mono font-bold text-emerald-400">Reconciled</p>
            </div>
          </div>
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-xs space-y-1.5 font-mono text-white/60">
            <div className="flex justify-between">
              <span>Task: Commercial Quote Approval</span>
              <span className="text-emerald-400 font-bold">COMPLETED</span>
            </div>
            <div className="flex justify-between">
              <span>Task: Work-in-Progress Milestone Review</span>
              <span className="text-[#00D9FF]">IN PROGRESS</span>
            </div>
          </div>
        </div>
      )}

      {project.id === "goalflow" && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono font-bold text-white">Q3 Milestone Execution</span>
              <span className="text-xs font-mono text-[#00D9FF] font-bold">84% COMPLETED</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-[#00D9FF] h-full w-[84%]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono">
              <p className="text-[10px] text-white/40">GOAL 01</p>
              <p className="text-white/80 font-bold">Release Platform Beta</p>
              <p className="text-[10px] text-emerald-400 mt-1">&bull; On track</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono">
              <p className="text-[10px] text-white/40">GOAL 02</p>
              <p className="text-white/80 font-bold">API Security Audit</p>
              <p className="text-[10px] text-[#FFB300] mt-1">&bull; In review</p>
            </div>
          </div>
        </div>
      )}

      {project.id === "quotation-invoice" && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-white/40">DOCUMENT PREVIEW</p>
              <p className="text-xs font-mono font-bold text-white">Tax Invoice #ZYX-2026-092</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
              GST 18% APPLIED
            </span>
          </div>
          <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 font-mono text-xs space-y-1 text-white/70">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Engineering Services (HSN 998314)</span>
              <span>₹1,50,000</span>
            </div>
            <div className="flex justify-between border-b border-white/5 py-1">
              <span>CGST (9%) + SGST (9%)</span>
              <span>₹27,000</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-white">
              <span>Total Invoice Amount</span>
              <span className="text-emerald-400">₹1,77,000</span>
            </div>
          </div>
          <p className="text-[11px] font-mono text-white/40">One-click PDF Export &bull; Automated Follow-up Alerts</p>
        </div>
      )}

      {project.id === "production-management" && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-mono text-white/40">BATCH ENGINE</p>
              <p className="text-xs font-mono font-bold text-white">Batch #BM-2026-409</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30">
              FEFO COMPLIANT
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40">RAW MATERIAL DEDUCTION</p>
              <p className="text-white/90 font-bold">140 kg / 150 kg</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#00D9FF] h-full w-[93%]" />
              </div>
            </div>
            <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-white/40">AUDIT TRAIL</p>
              <p className="text-emerald-400 font-bold">Verified Sign-off</p>
              <p className="text-[10px] text-white/40 mt-1">QC Passed 11:20 AM</p>
            </div>
          </div>
          <p className="text-[11px] font-mono text-white/40">Low-Stock Alerts &bull; Batch Expiry Scheduling</p>
        </div>
      )}

      {project.id === "interactive-websites" && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-mono text-white/40">RENDER PIPELINE</p>
              <p className="text-xs font-mono font-bold text-white">WebGL &bull; Three.js &bull; GSAP</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-400/10 text-emerald-400 font-bold">
              60.0 FPS
            </span>
          </div>
          <div className="h-28 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00D9FF_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="w-16 h-16 rounded-full border border-dashed border-[#00D9FF]/60 animate-spin" />
            <div className="absolute text-[11px] font-mono text-white/60">GPU-ACCELERATED MOTION</div>
          </div>
          <p className="text-[11px] font-mono text-white/40">Next.js 16 SSR &bull; Lighthouse 95+ Core Web Vitals</p>
        </div>
      )}
    </div>
  );
}

export function ProjectsOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { hoveredId, activeId } = useSelectionStore(projectStore);
  const highlightedProjectId = hoveredId || activeId;

  const aviationProjects = siteContent.projects.filter((p) => p.group === "aviation");
  const businessProjects = siteContent.projects.filter((p) => p.group === "business");

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
          {siteContent.projectGroups.aviation.title}
        </h2>
        <p className="reveal-text text-[#BFC7D5] max-w-xl text-base md:text-lg pointer-events-auto">
          {siteContent.projectGroups.aviation.subtitle}
        </p>
      </section>

      {/* Aviation Projects List */}
      {aviationProjects.map((project, idx) => {
        const isEven = idx % 2 === 0;
        const isHighlighted = highlightedProjectId === project.id;
        return (
          <section
            key={project.id}
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
              } ${
                isHighlighted
                  ? "ring-2 ring-[#00D9FF]/70 bg-[#00D9FF]/[0.03] shadow-[0_0_32px_rgba(0,217,255,0.12)]"
                  : ""
              }`}
            >
              {/* Left Column: Project Info */}
              <div className="lg:col-span-5 pointer-events-auto">
                <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] mb-4">
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
                    {siteContent.regulators.note}
                  </p>
                )}
                <div className="reveal-text pt-2">
                  <Link
                    href="/aviation-academy-software"
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors shadow-md"
                  >
                    <span>View Aviation Module</span>
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
      })}

      {/* GROUP 2: Businesses */}
      <section id="business-systems" className="projects-section content-visibility-auto w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="reveal-text text-xs font-mono uppercase tracking-[0.25em] text-[#6E5BFF] px-3 py-1 rounded-full bg-[#6E5BFF]/10 border border-[#6E5BFF]/30 mb-4 pointer-events-auto">
          Group 02 &bull; Enterprise &amp; SMEs
        </span>
        <h2 className="reveal-text text-3xl md:text-5xl font-bold text-white mb-4 pointer-events-auto">
          {siteContent.projectGroups.business.title}
        </h2>
        <p className="reveal-text text-[#BFC7D5] max-w-xl text-base md:text-lg pointer-events-auto">
          {siteContent.projectGroups.business.subtitle}
        </p>
      </section>

      {/* Business Projects List */}
      {businessProjects.map((project, idx) => {
        const isEven = idx % 2 === 0;
        const isHighlighted = highlightedProjectId === project.id;
        const isRaiseLab = project.id === "raise-lab-equipment";
        return (
          <section
            key={project.id}
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
              } ${
                isHighlighted
                  ? isRaiseLab
                    ? "ring-2 ring-[#00FFB2]/80 bg-[#00FFB2]/[0.04] shadow-[0_0_32px_rgba(0,255,178,0.14)]"
                    : "ring-2 ring-[#6E5BFF]/80 bg-[#6E5BFF]/[0.04] shadow-[0_0_32px_rgba(110,91,255,0.14)]"
                  : ""
              }`}
            >
              {/* Left Column: Project Info */}
              <div className="lg:col-span-5 pointer-events-auto">
                <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#6E5BFF]/10 border border-[#6E5BFF]/30 text-[#6E5BFF] mb-4">
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
                <div className="reveal-text pt-2">
                  <Link
                    href={project.href || "/contact"}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors shadow-md"
                  >
                    <span>Inquire About System</span>
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
      })}

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
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors shadow-xl"
          >
            Start a Project with ZYXEN &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
