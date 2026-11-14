"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { siteContent } from "@/content/site";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";

export function TechOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let cancelled = false;
    let initialized = false;
    const scroller = document.getElementById("scroll-container-tech");

    const initAnimations = () => {
      if (cancelled || initialized) return;
      initialized = true;
      cleanupListeners();

      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
        ([{ default: gsap }, { ScrollTrigger }]) => {
          if (cancelled) return;
          gsap.registerPlugin(ScrollTrigger);
          ScrollTrigger.config({ ignoreMobileResize: true });

          const sections = gsap.utils.toArray(".tech-section") as HTMLElement[];
          sections.slice(1).forEach((section) => {
            const texts = section.querySelectorAll(".reveal-text");
            gsap.fromTo(
              texts,
              { scale: 1.05, opacity: 0, y: 30 },
              {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: "back.out(1.7)",
                scrollTrigger: {
                  trigger: section,
                  scroller: "#scroll-container-tech",
                  start: "top center",
                  end: "center center",
                  scrub: false,
                },
              }
            );
          });
        }
      );
    };

    const cleanupListeners = () => {
      scroller?.removeEventListener("scroll", initAnimations);
      window.removeEventListener("wheel", initAnimations);
      window.removeEventListener("touchstart", initAnimations);
      window.removeEventListener("keydown", initAnimations);
    };

    if (scroller && scroller.scrollTop > 0) {
      initAnimations();
    } else {
      scroller?.addEventListener("scroll", initAnimations, { passive: true, once: true });
      window.addEventListener("wheel", initAnimations, { passive: true, once: true });
      window.addEventListener("touchstart", initAnimations, { passive: true, once: true });
      window.addEventListener("keydown", initAnimations, { passive: true, once: true });
    }

    return () => {
      cancelled = true;
      cleanupListeners();
    };
  }, []);

  const tagColors = [
    "text-[#00D9FF] border-[#00D9FF]/30 bg-[#00D9FF]/10",
    "text-[#6E5BFF] border-[#6E5BFF]/30 bg-[#6E5BFF]/10",
    "text-[#00FF9D] border-[#00FF9D]/30 bg-[#00FF9D]/10",
    "text-[#FFB300] border-[#FFB300]/30 bg-[#FFB300]/10",
  ];

  return (
    <div id="overlay-container-tech" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      {/* Hero Section */}
      <section className="tech-section w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="hero-entrance pointer-events-auto mb-6">
          <Breadcrumbs items={[{ label: "Technology" }]} />
        </div>
        <p className="hero-entrance text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-4 pointer-events-auto">
          Architecture &amp; Quality
        </p>
        <h1 className="hero-entrance-delay text-[clamp(2.5rem,6vw,5.5rem)] font-bold tracking-tighter text-[#FFFFFF] mb-4 pointer-events-auto leading-tight">
          {siteContent.technology.headline}
        </h1>
        <p className="hero-entrance-delay-2 text-lg md:text-xl text-[#6E5BFF] font-mono tracking-wide pointer-events-auto max-w-2xl">
          {siteContent.technology.subHeadline}
        </p>
      </section>

      {/* Engineering Standards Section */}
      <section className="tech-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-20 py-20">
        <div className="max-w-5xl w-full pointer-events-auto glass-panel p-6 sm:p-8 md:p-12 rounded-3xl border border-[#00D9FF]/30">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="reveal-text text-[clamp(1.75rem,4vw,3rem)] font-bold mb-4 text-[#FFFFFF] leading-tight">
              {siteContent.technology.cardHeading}
            </h2>
            <p className="reveal-text text-[#BFC7D5] text-base md:text-lg leading-relaxed">
              {siteContent.technology.cardDescription}
            </p>
          </div>

          <div className="reveal-text grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {siteContent.technology.principles.map((item, idx) => (
              <div
                key={item.title}
                className="p-6 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${tagColors[idx % tagColors.length]}`}>
                    {item.tag}
                  </span>
                  <span className="text-white/30 font-mono text-sm">0{idx + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-[#BFC7D5] text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="reveal-text mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-mono text-white/50 tracking-wider">
              RELIABLE STACKS &bull; SYSTEMATIC TESTING &bull; LONG-TERM CODEBASES
            </p>
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Discuss Your Stack Requirements &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
