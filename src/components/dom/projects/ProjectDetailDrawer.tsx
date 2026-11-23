"use client";

import { useRef, useState, useEffect, useId } from "react";
import Link from "next/link";
import type { ProjectItem } from "@/content/site";

// Extended tags and capabilities per project for the detail drawer
const PROJECT_TAGS: Record<string, string[]> = {
  "exam-portals": ["Next.js", "TypeScript", "PostgreSQL", "DGCA / FAA / EASA", "Timed Engine", "Role-Based Access"],
  "finance-fee": ["Accounting", "Multi-Currency", "Student Fee Ledgers", "GST Invoicing", "Audit Trail"],
  "admissions": ["Admissions Funnel", "Lead Pipeline", "Application Forms", "Status Tracking", "Analytics"],
  "erp-platform": ["Enterprise ERP", "Inventory Sync", "Branch Management", "Access Control", "Multi-Unit"],
  "pharma-quotation-system": ["Engineering Quoting", "Product Selection", "USD / INR FX", "Branded PDF Engine", "PWA App"],
  "zyops": ["Operations Management", "Kanban Workflows", "Work-in-Progress", "Accounts & Invoicing"],
  "goalflow": ["Sprint Tracking", "Team Execution", "Milestone Analytics", "Task Dependencies"],
  "quotation-invoice": ["GST Calculation", "Instant PDF Output", "Invoice Tracking", "Client Follow-ups"],
  "production-management": ["Batch Tracking", "FEFO Inventory", "Pharma / Chemical", "Audit Logging", "Low-Stock Alerts"],
  "interactive-websites": ["Next.js App Router", "Three.js 3D", "Tailwind CSS", "WCAG 2.1 AA", "SEO-First"],
};

const PROJECT_EXTENDED: Record<string, string> = {
  "exam-portals":
    "A full-scale pilot examination portal engineered for aviation training academies. Features realistic timed mock tests, authority-specific syllabus banks (DGCA, FAA, EASA), negative marking logic, and granular student analytics to prepare candidates for official licensing exams.",
  "finance-fee":
    "Comprehensive financial management platform for academies and educational institutions. Handles installment schedules, fee ledgers, automated invoice generation, student payment receipts, and reconciliation with complete audit logging.",
  "admissions":
    "End-to-end student enquiry and admissions workflow management system. Tracks prospective student leads from first contact through counseling, document submission, entrance exams, and final fee enrollment.",
  "erp-platform":
    "Integrated institutional ERP unifying sales, inventory, batch logistics, and departmental accounting across multi-campus operations with role-based access control.",
  "pharma-quotation-system":
    "Digital quotation and product specification platform engineered for pharmaceutical machinery manufacturing. Enables sales teams to configure complex equipment, calculate instant landed pricing, generate branded multi-currency PDF quotations, and track approval states.",
  "zyops":
    "Custom operations command center providing unified tracking for work orders, invoicing, team task distribution, client accounts, and real-time operational status.",
  "goalflow":
    "High-visibility team execution platform structured around milestone management, sprint goals, productivity metrics, and bottleneck identification.",
  "quotation-invoice":
    "Streamlined quotation and invoicing utility built for growing SMEs. Includes automated GST calculations, customizable invoice themes, PDF export, and payment reminders.",
  "production-management":
    "Industrial batch tracking and raw-materials ERP tailored for regulated pharma and chemical manufacturing. Implements First-Expired, First-Out (FEFO) material routing, low-stock notifications, and compliance audit trails.",
  "interactive-websites":
    "Bespoke digital brand presences developed with Next.js, WebGL 3D canvas experiences, performant animations, high-contrast accessible typography, and SEO best practices.",
};

export function ProjectDetailDrawer({
  project,
  isOpen,
  onClose,
}: {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const timer = setTimeout(() => {
        setVisible(true);
        closeButtonRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus management & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!mounted || !project) return null;

  const isAviation = project.group === "aviation";
  const tags = PROJECT_TAGS[project.id] || ["Web Platform", "System Architecture"];
  const extendedDesc = PROJECT_EXTENDED[project.id] || project.tagline;
  const accentColor = isAviation
    ? "#00D9FF"
    : project.id === "pharma-quotation-system"
      ? "#00FFB2"
      : "#A78BFA";

  return (
    <div
      role="region"
      aria-label="Project details modal region"
      className={`fixed inset-0 z-50 pointer-events-auto transition-opacity duration-300 ${
        visible ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}
    >
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-none md:backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        data-drawer-open={isOpen ? "true" : "false"}
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={`fixed top-0 right-0 bottom-0 w-full sm:max-w-xl bg-[#05060d]/[0.96] border-l border-white/[0.12] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),-16px_0_48px_rgba(0,0,0,0.85)] backdrop-blur-none md:backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Top Bar: Badge, status indicator and close button */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.12]">
            <div className="flex items-center gap-3">
              <span
                className="inline-block text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                style={{
                  color: accentColor,
                  borderColor: `${accentColor}40`,
                  backgroundColor: `${accentColor}15`,
                }}
              >
                {project.badge}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM ACTIVE
              </span>
            </div>

            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close project detail drawer"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Title & Tagline */}
          <div>
            <h3 id={titleId} className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              {project.name}
            </h3>
            <p className="text-sm sm:text-base font-mono text-[#00D9FF]/90">
              {project.tagline}
            </p>
          </div>

          {/* Extended Description */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
              Architecture &amp; Mission
            </h4>
            <p id={descId} className="text-sm leading-relaxed text-[#D8DFEC]">
              {extendedDesc}
            </p>
          </div>

          {/* Features / Capabilities */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
              Included Modules &amp; Engine Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.features.map((feat) => (
                <div
                  key={feat}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs font-mono text-white/90"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="capitalize">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack & Tags */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
              Technical Stack &amp; Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Regulatory note if applicable */}
          {project.id === "exam-portals" && (
            <div className="rounded-xl border border-[#00D9FF]/20 bg-[#00D9FF]/5 p-3.5 text-xs text-[#D8DFEC]">
              <p className="font-semibold text-[#00D9FF] mb-1 font-mono uppercase tracking-wider">
                Multi-Authority Compliance
              </p>
              Configured to follow the exam pattern and rules of DGCA (India), FAA (USA), EASA (Europe), and other authorities on request.
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-white/[0.12] mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href={isAviation ? "/aviation-academy-software" : (project.href || "/contact")}
            className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
          >
            <span>{isAviation ? "View Aviation Academy Software" : "Inquire About Platform"}</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <button
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center justify-center px-5 py-3 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-wider text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}
