"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ProjectsOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = gsap.utils.toArray(".projects-section") as HTMLElement[];
    sections.forEach((section) => {
      const texts = section.querySelectorAll(".reveal-text");
      gsap.fromTo(
        texts,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            scroller: "#scroll-container-projects",
            start: "top 70%",
            end: "center center",
            scrub: false,
          },
        }
      );
    });
  }, []);

  return (
    <div id="overlay-container-projects" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      <section className="projects-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <h1 className="reveal-text text-5xl md:text-7xl font-bold tracking-tighter text-[#00D9FF] mb-4 pointer-events-auto">
          PROJECT: AURA INTELLIGENCE
        </h1>
        <div className="reveal-text glass-panel p-6 rounded-xl max-w-md pointer-events-auto border border-[#00D9FF]/20">
          <p className="text-[#BFC7D5] text-lg">
            A sentient CRM system that predicts consumer behavior using localized quantum computing clusters.
          </p>
        </div>
      </section>

      <section className="projects-section w-full h-[100vh] flex flex-col items-center justify-center px-8 md:px-24">
        <h1 className="reveal-text text-5xl md:text-7xl font-bold tracking-tighter text-[#6E5BFF] mb-4 pointer-events-auto">
          PROJECT: AROMA DIGITAL
        </h1>
        <div className="reveal-text glass-panel p-6 rounded-xl max-w-md text-center pointer-events-auto border border-[#6E5BFF]/20">
          <p className="text-[#BFC7D5] text-lg">
            Next-generation digital sensory experiences and immersive web applications.
          </p>
        </div>
      </section>

      <section className="projects-section w-full h-[100vh] flex flex-col items-end justify-center px-8 md:px-24">
        <h1 className="reveal-text text-5xl md:text-7xl font-bold tracking-tighter text-[#FF0055] mb-4 pointer-events-auto">
          PROJECT: ARGUS ANALYTICS
        </h1>
        <div className="reveal-text glass-panel p-6 rounded-xl max-w-md text-right pointer-events-auto border border-[#FF0055]/20">
          <p className="text-[#BFC7D5] text-lg">
            Deep data analytics and visualization platform for enterprise scale decision making.
          </p>
        </div>
      </section>

      <section className="projects-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <h1 className="reveal-text text-5xl md:text-7xl font-bold tracking-tighter text-[#00FF9D] mb-4 pointer-events-auto">
          PROJECT: LUMINA CORE
        </h1>
        <div className="reveal-text glass-panel p-6 rounded-xl max-w-md pointer-events-auto border border-[#00FF9D]/20">
          <p className="text-[#BFC7D5] text-lg">
            Core processing and AI optimization engines designed for ultra-low latency operations.
          </p>
        </div>
      </section>

      <section className="projects-section w-full h-[100vh] flex flex-col items-center justify-center px-8 md:px-24">
        <h1 className="reveal-text text-5xl md:text-7xl font-bold tracking-tighter text-[#FFB300] mb-4 pointer-events-auto">
          PROJECT: SPACEFLUX WEB
        </h1>
        <div className="reveal-text glass-panel p-6 rounded-xl max-w-md text-center pointer-events-auto border border-[#FFB300]/20">
          <p className="text-[#BFC7D5] text-lg">
            High-performance web architectures enabling seamless multi-device continuity.
          </p>
        </div>
      </section>
    </div>
  );
}
