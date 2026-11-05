"use client";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContactForm } from "./ContactForm";
import { siteContent } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

export function Overlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = gsap.utils.toArray(".chapter-section") as HTMLElement[];
    sections.forEach((section) => {
      const texts = section.querySelectorAll(".reveal-text");
      if (prefersReducedMotion) {
        gsap.set(texts, { y: 0, opacity: 1 });
        return;
      }
      gsap.fromTo(
        texts,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            scroller: "#scroll-container",
            start: "top center",
            end: "center center",
            scrub: false,
          },
        }
      );
    });
  }, []);

  return (
    <div id="overlay-container" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      {/* Chapter 1: Arrival / Hero */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="reveal-text text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#BFC7D5] mb-6 pointer-events-auto">
          {siteContent.home.hero.headline}
        </h1>
        <p className="reveal-text mt-4 text-[#BFC7D5] max-w-2xl text-base md:text-lg font-light tracking-wide pointer-events-auto mx-auto leading-relaxed">
          {siteContent.home.hero.subHeadline}
        </p>
        <div className="reveal-text mt-10 flex gap-4 md:gap-6 justify-center pointer-events-auto flex-wrap">
          <button 
            onClick={() => setIsContactOpen(true)}
            className="px-8 py-3 bg-[#00D9FF] text-black font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white hover:scale-105 transition-all"
          >
            {siteContent.home.hero.primaryCta}
          </button>
          <a 
            href="/aviation-academy-software" 
            className="px-8 py-3 bg-white/10 border border-[#00D9FF]/40 text-[#00D9FF] font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#00D9FF]/20 hover:scale-105 transition-all"
          >
            {siteContent.home.hero.aviationCta}
          </a>
          <a 
            href="/projects" 
            className="px-8 py-3 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-all"
          >
            {siteContent.home.hero.secondaryCta}
          </a>
        </div>
      </section>

      {/* Chapter 2: The Mission */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-2xl pointer-events-auto glass-panel p-8 rounded-2xl">
          <p className="reveal-text text-xs text-[#00D9FF] uppercase tracking-[0.3em] font-bold mb-4">
            {siteContent.home.mission.tag}
          </p>
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-6">
            {siteContent.home.mission.heading}
          </h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed">
            {siteContent.home.mission.description}
          </p>
        </div>
      </section>

      {/* Chapter 3: Core Capabilities */}
      <section className="chapter-section w-full h-[100vh] flex flex-col justify-center px-8 md:px-24">
        <div className="pointer-events-auto">
          <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-12 text-[#6E5BFF]">
            {siteContent.home.capabilities.heading}
          </h2>
          
          <div className="flex flex-col gap-8 max-w-3xl">
            {siteContent.home.capabilities.items.map((item, idx) => {
              const borderColors = ["border-[#00D9FF]", "border-[#6E5BFF]", "border-[#FF0055]"];
              const margins = ["", "ml-0 md:ml-12", "ml-0 md:ml-24"];
              return (
                <div key={item.title} className={`reveal-text border-l-2 ${borderColors[idx % borderColors.length]} pl-6 ${margins[idx % margins.length]}`}>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[#BFC7D5]">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="reveal-text mt-10">
            <a 
              href="/aviation-academy-software" 
              className="text-sm font-semibold text-[#00D9FF] hover:underline inline-flex items-center gap-1.5"
            >
              Explore Aviation Academy Software Modules &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Chapter 4: Future Vision & Contact */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-center justify-center px-4">
        <div className="pointer-events-auto text-center bg-[#050505]/80 p-12 rounded-3xl backdrop-blur-md border border-[#00D9FF]/20 max-w-3xl">
          <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D9FF]">
            {siteContent.home.cta.heading}
          </h2>
          <p className="reveal-text text-[#BFC7D5] text-lg mb-10">
            {siteContent.home.cta.description}
          </p>
          <div className="reveal-text flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsContactOpen(true)}
              className="px-8 py-4 bg-[#FFFFFF] text-[#050505] font-bold tracking-widest uppercase text-sm rounded-full hover:bg-[#BFC7D5] hover:scale-105 transition-all duration-300"
            >
              {siteContent.home.cta.primaryButton}
            </button>
            <a 
              href="/services"
              className="px-8 py-4 border border-white/20 text-white font-bold tracking-widest uppercase text-sm rounded-full hover:bg-white/10 transition-all duration-300 inline-block"
            >
              {siteContent.home.cta.secondaryButton}
            </a>
          </div>
        </div>
      </section>

      <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
