"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { siteContent } from "@/content/site";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";

export function ServicesOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let cancelled = false;
    let initialized = false;
    const scroller = document.getElementById("scroll-container-services");

    const initAnimations = () => {
      if (cancelled || initialized) return;
      initialized = true;
      cleanupListeners();

      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
        ([{ default: gsap }, { ScrollTrigger }]) => {
          if (cancelled) return;
          gsap.registerPlugin(ScrollTrigger);
          ScrollTrigger.config({ ignoreMobileResize: true });

          const sections = gsap.utils.toArray(".services-section") as HTMLElement[];
          sections.slice(1).forEach((section) => {
            const texts = section.querySelectorAll(".reveal-text");
            gsap.fromTo(
              texts,
              { x: -40, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: section,
                  scroller: "#scroll-container-services",
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

  const borderClasses = [
    "border-l-4 border-l-[#00D9FF]",
    "border-r-4 border-r-[#6E5BFF] text-right",
    "border-l-4 border-l-[#FF0055]",
    "border-r-4 border-r-[#00FF9D] text-right",
    "border-l-4 border-l-[#FFB300]",
    "border-r-4 border-r-[#00D9FF] text-right",
  ];

  return (
    <div id="overlay-container-services" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      {/* Intro Section */}
      <section className="services-section w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="hero-entrance pointer-events-auto mb-6">
          <Breadcrumbs items={[{ label: "Services" }]} />
        </div>
        <p className="hero-entrance text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-4 pointer-events-auto">
          Capacities &amp; Disciplines
        </p>
        <h1 className="hero-entrance-delay text-5xl md:text-7xl font-extrabold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto">
          SOFTWARE &amp; WEB.
        </h1>
        <p className="hero-entrance-delay-2 text-base md:text-xl text-[#BFC7D5] max-w-2xl font-light leading-relaxed pointer-events-auto">
          Explore our tailored development capabilities—from pilot-training exam software and academy fee systems to high-speed business applications and interactive 3D websites.
        </p>
      </section>

      {/* Services Iteration */}
      {siteContent.services.map((service, idx) => {
        const isRight = idx % 2 !== 0;
        return (
          <section
            key={service.id}
            id={service.id}
            className={`services-section content-visibility-auto w-full min-h-[100svh] flex flex-col ${isRight ? "items-end" : "items-start"} justify-center px-6 md:px-24 py-16`}
          >
            <div className={`max-w-xl w-full pointer-events-auto glass-panel p-6 sm:p-8 md:p-10 rounded-2xl ${borderClasses[idx % borderClasses.length]} backdrop-blur-md`}>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-[#00D9FF] mb-2 sm:mb-3">
                {service.number}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FFFFFF] mb-3 sm:mb-4">
                {service.name}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#BFC7D5] font-light leading-relaxed mb-4 sm:mb-6">
                {service.description}
              </p>

              {/* Highlights */}
              <div className={`flex flex-wrap gap-2 mb-8 ${isRight ? "justify-end" : "justify-start"}`}>
                {service.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded bg-white/5 border border-white/10 text-white/80"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div>
                <Link
                  href={service.linkUrl}
                  className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#00D9FF] hover:text-[#FFFFFF] transition-colors"
                >
                  {service.linkText}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
