"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

  return (
    <div id="overlay-container-services" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      <section className="services-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="reveal-text text-5xl md:text-8xl font-bold tracking-tighter text-[#FFFFFF] mb-4 pointer-events-auto">
          CAPABILITIES
        </h1>
        <p className="reveal-text text-xl md:text-2xl text-[#00D9FF] font-mono tracking-widest pointer-events-auto">
          Scroll to explore the carousel.
        </p>
      </section>

      <section className="services-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl border-l-4 border-l-[#00D9FF]">
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-6 text-[#FFFFFF]">Artificial Intelligence</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed">
            Neural networks engineered for massive scale. Predictive models that anticipate user needs before they occur.
          </p>
        </div>
      </section>

      <section className="services-section w-full h-[100vh] flex flex-col items-end justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl border-r-4 border-r-[#6E5BFF] text-right">
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-6 text-[#FFFFFF]">Cloud Architecture</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed">
            Serverless, decentralized, and infinitely scalable infrastructure capable of routing exabytes of data in milliseconds.
          </p>
        </div>
      </section>

      <section className="services-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl border-l-4 border-l-[#FFFFFF]">
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-6 text-[#FFFFFF]">Automation Systems</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed">
            Autonomous workflows that remove human error and increase operational velocity by orders of magnitude.
          </p>
        </div>
      </section>
    </div>
  );
}
