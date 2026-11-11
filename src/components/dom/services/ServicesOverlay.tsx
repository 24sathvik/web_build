"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

export function ServicesOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = gsap.utils.toArray(".services-section") as HTMLElement[];
    sections.slice(1).forEach((section) => {
      const texts = section.querySelectorAll(".reveal-text");
      if (prefersReducedMotion) {
        gsap.set(texts, { x: 0, opacity: 1 });
        return;
      }
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
  }, []);

  const borderClasses = [
    "border-l-4 border-l-[#00D9FF]",
    "border-r-4 border-r-[#6E5BFF] text-right",
    "border-l-4 border-l-[#FF0055]",
    "border-r-4 border-r-[#00FF9D] text-right",
    "border-l-4 border-l-[#FFB300]",
    "border-r-4 border-r-[#FFFFFF] text-right",
  ];

  const numberColors = [
    "text-[#00D9FF]",
    "text-[#6E5BFF]",
    "text-[#FF0055]",
    "text-[#00FF9D]",
    "text-[#FFB300]",
    "text-[#FFFFFF]",
  ];

  return (
    <div id="overlay-container-services" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      <section className="services-section w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4 py-20">
        <p className="hero-entrance text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-4 pointer-events-auto">
          Our Services
        </p>
        <h1 className="hero-entrance-delay text-[clamp(2.5rem,6vw,5.5rem)] font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto leading-tight">
          SOFTWARE &amp; WEB.
        </h1>
        <p className="hero-entrance-delay-2 text-base md:text-xl text-[#BFC7D5] max-w-2xl font-light pointer-events-auto leading-relaxed">
          Custom software, exam engines, fee systems, and high-performance websites built for aviation academies and growing businesses.
        </p>
      </section>

      {siteContent.services.map((service, idx) => {
        const isRight = idx % 2 === 1;
        return (
          <section
            key={service.id}
            className={`services-section content-visibility-auto w-full min-h-[100svh] flex flex-col ${isRight ? "items-end" : "items-start"} justify-center px-6 md:px-24 py-16`}
          >
            <div className={`max-w-xl w-full pointer-events-auto glass-panel p-6 sm:p-8 md:p-10 rounded-2xl ${borderClasses[idx % borderClasses.length]} backdrop-blur-md`}>
              <p className={`reveal-text text-sm font-bold font-mono ${numberColors[idx % numberColors.length]} mb-2 tracking-widest`}>
                {service.number}
              </p>
              <h2 className="reveal-text text-[clamp(1.75rem,4vw,3rem)] font-bold mb-4 text-[#FFFFFF] leading-tight">
                {service.name}
              </h2>
              <p className="reveal-text text-[#BFC7D5] text-base md:text-lg leading-relaxed mb-6">
                {service.description}
              </p>
              <div className={`reveal-text flex flex-wrap gap-2 mb-6 ${isRight ? "justify-end" : "justify-start"}`}>
                {service.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="text-xs uppercase font-mono tracking-wider px-2.5 py-1 rounded bg-white/5 text-white/70 border border-white/10"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <div className={`reveal-text pt-4 border-t border-white/10 flex ${isRight ? "justify-end" : "justify-start"}`}>
                <Link
                  href={service.linkUrl}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs font-mono uppercase tracking-wider hover:bg-white/90 transition-colors shadow-md"
                >
                  <span>{service.linkText}</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
