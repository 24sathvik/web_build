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
        <p className="reveal-text text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-bold mb-4 pointer-events-auto">
          Our Capabilities
        </p>
        <h1 className="reveal-text text-5xl md:text-8xl font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto">
          ENGINEERED SUCCESS.
        </h1>
        <p className="reveal-text text-xl md:text-2xl text-[#BFC7D5] max-w-2xl font-light pointer-events-auto">
          We provide the technical infrastructure and design precision needed to dominate the digital landscape. From backend core infrastructure to sensory frontend interfaces.
        </p>
      </section>

      {/* 01. Web Ecosystems */}
      <section className="services-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl border-l-4 border-l-[#00D9FF]">
          <p className="reveal-text text-sm font-bold text-[#00D9FF] mb-2 tracking-widest">01</p>
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-4 text-[#FFFFFF]">Web Ecosystems</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed mb-6">
            Architecting high-performance digital environments that serve as the backbone for global enterprises.
          </p>
          <p className="reveal-text text-xs text-white/50 font-mono tracking-widest uppercase">
            Neural Interfaces • Sub-second Latency • Elastic Scaling • Enterprise Grade
          </p>
        </div>
      </section>

      {/* 02. Mobile Intelligence */}
      <section className="services-section w-full h-[100vh] flex flex-col items-end justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl border-r-4 border-r-[#6E5BFF] text-right">
          <p className="reveal-text text-sm font-bold text-[#6E5BFF] mb-2 tracking-widest">02</p>
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-4 text-[#FFFFFF]">Mobile Intelligence</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed mb-6">
            Developing native applications that bridge the gap between human intent and software precision.
          </p>
          <p className="reveal-text text-xs text-white/50 font-mono tracking-widest uppercase">
            iOS & Android • Real-time Sync • Edge Computing • Biometric Security
          </p>
        </div>
      </section>

      {/* 03. Design Systems */}
      <section className="services-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl border-l-4 border-l-[#FF0055]">
          <p className="reveal-text text-sm font-bold text-[#FF0055] mb-2 tracking-widest">03</p>
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-4 text-[#FFFFFF]">Design Systems</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed mb-6">
            Creating visual languages that communicate authority and inspire absolute brand loyalty.
          </p>
          <p className="reveal-text text-xs text-white/50 font-mono tracking-widest uppercase">
            Sensory UX • Dynamic Branding • Motion Protocols • Visual Identity
          </p>
        </div>
      </section>

      {/* 04. Neural Automation */}
      <section className="services-section w-full h-[100vh] flex flex-col items-end justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl border-r-4 border-r-[#00FF9D] text-right">
          <p className="reveal-text text-sm font-bold text-[#00FF9D] mb-2 tracking-widest">04</p>
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-4 text-[#FFFFFF]">Neural Automation</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed mb-6">
            Deploying AI-driven workflows that transform complex processes into effortless productivity.
          </p>
          <p className="reveal-text text-xs text-white/50 font-mono tracking-widest uppercase">
            Process Evolution • Smart Logic • Zero Friction • Predictive Analytics
          </p>
        </div>
      </section>

      {/* 05. Backend Core */}
      <section className="services-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl border-l-4 border-l-[#FFB300]">
          <p className="reveal-text text-sm font-bold text-[#FFB300] mb-2 tracking-widest">05</p>
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-4 text-[#FFFFFF]">Backend Core</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed mb-6">
            Systems engineered for absolute stability, processing millions of requests with cryptographic safety.
          </p>
          <p className="reveal-text text-xs text-white/50 font-mono tracking-widest uppercase">
            Secure API • Microservices • Cloud Native • Database Logic
          </p>
        </div>
      </section>

      {/* 06. Digital Strategy */}
      <section className="services-section w-full h-[100vh] flex flex-col items-end justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl border-r-4 border-r-[#FFFFFF] text-right">
          <p className="reveal-text text-sm font-bold text-[#FFFFFF] mb-2 tracking-widest">06</p>
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-4 text-[#FFFFFF]">Digital Strategy</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed mb-6">
            Defining the trajectory for market leaders through data-driven insights and technical audits.
          </p>
          <p className="reveal-text text-xs text-white/50 font-mono tracking-widest uppercase">
            Market Analysis • Growth Logic • Security Audits • Scalability Roadmap
          </p>
        </div>
      </section>
    </div>
  );
}
