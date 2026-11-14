"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { siteContent } from "@/content/site";

const ContactForm = dynamic(() => import("./ContactForm").then((m) => m.ContactForm), {
  ssr: false,
});

export function Overlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let cancelled = false;
    let initialized = false;
    const scroller = document.getElementById("scroll-container");

    const initAnimations = () => {
      if (cancelled || initialized) return;
      initialized = true;
      cleanupListeners();

      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
        ([{ default: gsap }, { ScrollTrigger }]) => {
          if (cancelled) return;
          gsap.registerPlugin(ScrollTrigger);
          ScrollTrigger.config({ ignoreMobileResize: true });

          const sections = gsap.utils.toArray(".chapter-section") as HTMLElement[];
          // Requirement 2: Remove GSAP-controlled initial hidden state from first section (Hero).
          // Section 0 uses pure CSS animation with initial opacity:1 in server HTML.
          // Later sections (Chapters 2..5) keep their GSAP scroll reveals (lazy-loaded on first scroll/interaction).
          sections.slice(1).forEach((section) => {
            if (section.getBoundingClientRect().top < window.innerHeight * 0.75) {
              return;
            }
            const texts = section.querySelectorAll(".reveal-text");
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
        }
      );
    };

    const onFirstScrollOrInteract = () => {
      initAnimations();
    };

    const cleanupListeners = () => {
      scroller?.removeEventListener("scroll", onFirstScrollOrInteract);
      window.removeEventListener("wheel", onFirstScrollOrInteract);
      window.removeEventListener("touchstart", onFirstScrollOrInteract);
      window.removeEventListener("keydown", onFirstScrollOrInteract);
    };

    if (scroller && scroller.scrollTop > 0) {
      initAnimations();
    } else {
      scroller?.addEventListener("scroll", onFirstScrollOrInteract, { passive: true, once: true });
      window.addEventListener("wheel", onFirstScrollOrInteract, { passive: true, once: true });
      window.addEventListener("touchstart", onFirstScrollOrInteract, { passive: true, once: true });
      window.addEventListener("keydown", onFirstScrollOrInteract, { passive: true, once: true });
    }

    return () => {
      cancelled = true;
      cleanupListeners();
    };
  }, []);

  return (
    <div id="overlay-container" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      {/* Chapter 1: Arrival / Hero - server rendered HTML visible immediately with pure CSS entrance */}
      <section className="chapter-section w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="hero-entrance text-[clamp(2.25rem,6vw,6.5rem)] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#BFC7D5] mb-6 pointer-events-auto leading-[1.05]">
          {siteContent.home.hero.headline}
        </h1>
        <p className="hero-entrance-delay mt-4 text-[#BFC7D5] max-w-2xl text-[clamp(1rem,1.2vw,1.125rem)] font-light tracking-wide pointer-events-auto mx-auto leading-relaxed">
          {siteContent.home.hero.subHeadline}
        </p>
        <div className="hero-entrance-delay-2 mt-10 flex gap-4 md:gap-6 justify-center pointer-events-auto flex-wrap">
          <button 
            onClick={() => setIsContactOpen(true)}
            className="min-h-[44px] px-8 py-3 bg-[#00D9FF] text-black font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white hover:scale-105 transition-all"
          >
            {siteContent.home.hero.primaryCta}
          </button>
          <a 
            href="/aviation-academy-software" 
            className="min-h-[44px] px-8 py-3 bg-white/10 border border-[#00D9FF]/40 text-[#00D9FF] font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#00D9FF]/20 hover:scale-105 transition-all inline-flex items-center"
          >
            {siteContent.home.hero.aviationCta}
          </a>
          <a 
            href="/projects" 
            className="min-h-[44px] px-8 py-3 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-all inline-flex items-center"
          >
            {siteContent.home.hero.secondaryCta}
          </a>
        </div>
      </section>

      {/* Chapter 2: The Mission */}
      <section className="chapter-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-start justify-center px-6 md:px-24 py-20">
        <div className="max-w-2xl pointer-events-auto glass-panel p-6 md:p-8 rounded-2xl">
          <p className="reveal-text text-xs text-[#00D9FF] uppercase tracking-[0.3em] font-bold mb-4">
            {siteContent.home.mission.tag}
          </p>
          <h2 className="reveal-text text-[clamp(1.75rem,4vw,3rem)] font-bold mb-6 leading-tight">
            {siteContent.home.mission.heading}
          </h2>
          <p className="reveal-text text-[#BFC7D5] text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed">
            {siteContent.home.mission.description}
          </p>
        </div>
      </section>

      {/* Chapter 3: Core Capabilities */}
      <section className="chapter-section content-visibility-auto w-full min-h-[100svh] flex flex-col justify-center px-6 md:px-24 py-20">
        <div className="pointer-events-auto">
          <h2 className="reveal-text text-[clamp(2rem,5vw,3.75rem)] font-bold mb-12 text-[#6E5BFF] leading-tight">
            {siteContent.home.capabilities.heading}
          </h2>
          
          <div className="flex flex-col gap-8 max-w-3xl">
            {siteContent.home.capabilities.items.map((item, idx) => {
              const borderColors = ["border-[#00D9FF]", "border-[#6E5BFF]", "border-[#FF0055]"];
              const margins = ["", "ml-0 md:ml-12", "ml-0 md:ml-24"];
              return (
                <div key={item.title} className={`reveal-text border-l-2 ${borderColors[idx % borderColors.length]} pl-6 ${margins[idx % margins.length]}`}>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[#BFC7D5] text-[clamp(1rem,1.1vw,1.125rem)]">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="reveal-text mt-10">
            <a 
              href="/aviation-academy-software" 
              className="min-h-[44px] text-base font-semibold text-[#00D9FF] hover:underline inline-flex items-center gap-1.5"
            >
              Explore Aviation Academy Software Modules &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Chapter 4: Future Vision & Contact */}
      <section className="chapter-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-center justify-center px-4 py-20">
        <div className="pointer-events-auto text-center bg-[#050505]/80 p-8 md:p-12 rounded-3xl backdrop-blur-md border border-[#00D9FF]/20 max-w-3xl">
          <h2 className="reveal-text text-[clamp(2rem,5vw,3.75rem)] font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D9FF] leading-tight">
            {siteContent.home.cta.heading}
          </h2>
          <p className="reveal-text text-[#BFC7D5] text-[clamp(1rem,1.2vw,1.125rem)] mb-10 leading-relaxed">
            {siteContent.home.cta.description}
          </p>
          <div className="reveal-text flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsContactOpen(true)}
              className="min-h-[44px] px-8 py-3.5 bg-[#FFFFFF] text-[#050505] font-bold tracking-widest uppercase text-sm rounded-full hover:bg-[#BFC7D5] hover:scale-105 transition-all duration-300"
            >
              {siteContent.home.cta.primaryButton}
            </button>
            <a 
              href="/services"
              className="min-h-[44px] px-8 py-3.5 border border-white/20 text-white font-bold tracking-widest uppercase text-sm rounded-full hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center"
            >
              {siteContent.home.cta.secondaryButton}
            </a>
          </div>
        </div>
      </section>

      {isContactOpen && (
        <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      )}
    </div>
  );
}
