"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "@/content/site";

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

  const alignments = [
    "items-start text-left",
    "items-center text-center",
    "items-end text-right",
  ];

  const colors = [
    { text: "text-[#00D9FF]", border: "border-[#00D9FF]/20", tag: "text-[#00D9FF]" },
    { text: "text-[#6E5BFF]", border: "border-[#6E5BFF]/20", tag: "text-[#6E5BFF]" },
    { text: "text-[#FF0055]", border: "border-[#FF0055]/20", tag: "text-[#FF0055]" },
    { text: "text-[#00FF9D]", border: "border-[#00FF9D]/20", tag: "text-[#00FF9D]" },
    { text: "text-[#FFB300]", border: "border-[#FFB300]/20", tag: "text-[#FFB300]" },
  ];

  return (
    <div id="overlay-container-projects" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      {/* Intro Header Section with the single H1 */}
      <section className="projects-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <p className="reveal-text text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-bold mb-4 pointer-events-auto">
          Portfolio &amp; Work
        </p>
        <h1 className="reveal-text text-5xl md:text-8xl font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto">
          SYSTEMS &amp; SITES.
        </h1>
        <p className="reveal-text text-xl md:text-2xl text-[#BFC7D5] max-w-2xl font-light pointer-events-auto leading-relaxed">
          Specialized software and high-performance websites engineered for aviation training academies, growing manufacturers, and modern service businesses.
        </p>
      </section>

      {/* Projects List */}
      {siteContent.projects.map((project, idx) => {
        const align = alignments[idx % alignments.length];
        const color = colors[idx % colors.length];
        return (
          <section
            key={project.id}
            className={`projects-section w-full h-[100vh] flex flex-col ${align} justify-center px-8 md:px-24`}
          >
            <h2 className={`reveal-text text-4xl md:text-6xl font-bold tracking-tighter ${color.text} mb-4 pointer-events-auto`}>
              {project.name}
            </h2>
            <div className={`reveal-text glass-panel p-6 md:p-8 rounded-xl max-w-lg pointer-events-auto border ${color.border} backdrop-blur-md`}>
              <p className="text-[#BFC7D5] text-lg mb-4 leading-relaxed">
                {project.tagline}
              </p>
              <div className="flex flex-wrap gap-2 justify-start items-center">
                {project.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs uppercase font-mono tracking-wider px-2.5 py-1 rounded bg-white/5 text-white/80 border border-white/10"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              {project.id === "exam-portals" && (
                <p className="mt-4 text-xs text-white/50 border-t border-white/10 pt-3 italic">
                  {siteContent.regulators.note}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
