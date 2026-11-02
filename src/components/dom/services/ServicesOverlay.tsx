"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

export function ServicesOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = gsap.utils.toArray(".services-section") as HTMLElement[];
    sections.forEach((section) => {
      const texts = section.querySelectorAll(".reveal-text");
      gsap.fromTo(
        texts,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
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
      <section className="services-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <p className="reveal-text text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-bold mb-4 pointer-events-auto">
          Our Services
        </p>
        <h1 className="reveal-text text-5xl md:text-8xl font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto">
          SOFTWARE &amp; WEB.
        </h1>
        <p className="reveal-text text-xl md:text-2xl text-[#BFC7D5] max-w-2xl font-light pointer-events-auto leading-relaxed">
          Custom software, exam engines, fee systems, and high-performance websites built for aviation academies and growing businesses.
        </p>
      </section>

      {siteContent.services.map((service, idx) => {
        const isRight = idx % 2 === 1;
        return (
          <section
            key={service.id}
            className={`services-section w-full h-[100vh] flex flex-col ${isRight ? "items-end" : "items-start"} justify-center px-8 md:px-24`}
          >
            <div className={`max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl ${borderClasses[idx % borderClasses.length]}`}>
              <p className={`reveal-text text-sm font-bold ${numberColors[idx % numberColors.length]} mb-2 tracking-widest`}>
                {service.number}
              </p>
              <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-4 text-[#FFFFFF]">
                {service.name}
              </h2>
              <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed mb-6">
                {service.description}
              </p>
              <p className="reveal-text text-xs text-white/50 font-mono tracking-widest uppercase">
                {service.highlights.join(" • ")}
              </p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
