"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function TechOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = gsap.utils.toArray(".tech-section") as HTMLElement[];
    sections.forEach((section) => {
      const texts = section.querySelectorAll(".reveal-text");
      gsap.fromTo(
        texts,
        { scale: 1.1, opacity: 0, y: 30 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
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
  }, []);

  return (
    <div id="overlay-container-tech" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      <section className="tech-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="reveal-text text-5xl md:text-8xl font-bold tracking-tighter text-[#FFFFFF] mb-4 pointer-events-auto">
          THE ENGINE
        </h1>
        <p className="reveal-text text-xl md:text-2xl text-[#6E5BFF] font-mono tracking-widest pointer-events-auto">
          Built on a quantum foundation.
        </p>
      </section>

      <section className="tech-section w-full h-[100vh] flex flex-col items-center justify-center px-8 md:px-24">
        <div className="max-w-2xl text-center pointer-events-auto glass-panel p-12 rounded-3xl border border-[#00D9FF]/30">
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-6 text-[#00D9FF]">Infinite Scalability</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed">
            Our proprietary distributed ledger technology ensures zero latency across global nodes. 
            We do not just rely on the cloud; we engineer the atmospheric layers that define it.
          </p>
        </div>
      </section>
    </div>
  );
}
