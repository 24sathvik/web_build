"use client";

import { useEffect, useState, useTransition } from "react";
import type { TocHeadingItem } from "@/lib/blog";

/**
 * Reading progress bar fixed at the very top of the viewport.
 * Zero layout shift, 60fps requestAnimationFrame, lightweight CSS transform.
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const currentY = window.scrollY;
        const pct = Math.min(100, Math.max(0, (currentY / scrollHeight) * 100));
        setProgress(pct);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-[70] pointer-events-none bg-white/[0.04]"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#00D9FF] via-[#6E5BFF] to-[#00D9FF] transition-all duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

interface TableOfContentsProps {
  headings: TocHeadingItem[];
  className?: string;
  onItemClick?: () => void;
}

/**
 * Interactive Table of Contents with server-rendered anchor links
 * and an IntersectionObserver active section highlight.
 */
export function TableOfContents({
  headings,
  className = "",
  onItemClick,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id || "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    // Observe each heading with an offset zone below the sticky header
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          intersecting.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          startTransition(() => {
            setActiveId(intersecting[0].target.id);
          });
        }
      },
      {
        rootMargin: "-96px 0px -65% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", `#${id}`);
      setActiveId(id);
      if (onItemClick) {
        onItemClick();
      }
    }
  };

  return (
    <ol className={`space-y-1 text-xs text-[#BFC7D5] ${className}`}>
      {headings.map((h) => {
        const isActive = activeId === h.id;
        return (
          <li
            key={h.id}
            className={`leading-snug transition-all ${
              h.level === 3 ? "ml-3.5 pl-2 border-l border-white/10" : ""
            }`}
          >
            <a
              href={`#${h.id}`}
              onClick={(e) => handleLinkClick(e, h.id)}
              className={`group flex items-center min-h-[36px] py-1.5 px-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-[#00D9FF]/[0.08] text-[#00D9FF] font-semibold border-l-2 border-[#00D9FF] -ml-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "text-[#BFC7D5] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent"
              }`}
            >
              <span className="truncate">{h.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Mobile/Tablet collapsible "On this page" disclosure panel.
 * Sits under the cover image, closed by default. Zero layout shift.
 */
export function MobileCollapsibleToc({
  headings,
}: {
  headings: TocHeadingItem[];
}) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors open:bg-white/[0.04]">
      <summary className="flex items-center justify-between cursor-pointer list-none select-none text-xs font-mono uppercase tracking-[0.2em] text-[#00D9FF] py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00D9FF]">
        <span className="flex items-center gap-2">
          <span>On this page</span>
          <span className="text-white/40 font-sans text-xs normal-case tracking-normal">
            ({headings.length} {headings.length === 1 ? "section" : "sections"})
          </span>
        </span>
        <svg
          className="w-4 h-4 text-[#00D9FF] transition-transform duration-200 group-open:rotate-180 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="mt-4 pt-4 border-t border-white/10 max-h-[320px] overflow-y-auto pr-1">
        <TableOfContents headings={headings} />
      </div>
    </details>
  );
}
