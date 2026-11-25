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
        <h1 className="text-[clamp(2.25rem,6vw,6.5rem)] font-bold tracking-tighter text-white mb-6 pointer-events-auto leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          {siteContent.home.hero.headline}
        </h1>
        <p className="mt-4 text-[#BFC7D5] max-w-2xl text-[clamp(1rem,1.2vw,1.125rem)] font-light tracking-wide pointer-events-auto mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          {siteContent.home.hero.subHeadline}
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-stretch sm:items-center pointer-events-auto w-full max-w-sm sm:max-w-none mx-auto">
          <button 
            onClick={() => setIsContactOpen(true)}
            className="precision-button min-h-[44px] px-6 sm:px-8 py-3 bg-[#00D9FF] text-black font-bold uppercase tracking-widest text-xs sm:text-sm rounded-full hover:bg-white hover:scale-105 transition-all text-center justify-center inline-flex items-center shadow-[0_0_20px_rgba(0,217,255,0.35)]"
          >
            {siteContent.home.hero.primaryCta}
          </button>
          <a 
            href="/aviation-academy-software" 
            className="precision-button min-h-[44px] px-6 sm:px-8 py-3 bg-[#0c152a]/80 border border-[#00D9FF]/40 text-[#00D9FF] font-bold uppercase tracking-widest text-xs sm:text-sm rounded-full hover:bg-[#00D9FF]/20 hover:scale-105 transition-all inline-flex items-center justify-center text-center"
          >
            {siteContent.home.hero.aviationCta}
          </a>
          <a 
            href="/projects" 
            className="precision-button min-h-[44px] px-6 sm:px-8 py-3 bg-[#121626]/80 border border-white/20 text-white font-bold uppercase tracking-widest text-xs sm:text-sm rounded-full hover:bg-white/10 transition-all inline-flex items-center justify-center text-center"
          >
            {siteContent.home.hero.secondaryCta}
          </a>
        </div>
      </section>

      {/* Chapter 2: The Mission */}
      <section className="chapter-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-start justify-center px-6 md:px-24 py-20">
        <div data-spotlight="true" className="max-w-2xl pointer-events-auto precision-card p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#0d152c]/95 via-[#080d1e]/95 to-[#050714]/95 border border-[#00D9FF]/25 shadow-2xl">
          <p className="reveal-text text-xs text-[#00D9FF] uppercase tracking-[0.3em] font-bold mb-4 font-mono">
            {siteContent.home.mission.tag}
          </p>
          <h2 className="reveal-text text-[clamp(1.75rem,4vw,3rem)] font-bold mb-6 leading-tight text-white">
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
          <h2 className="reveal-text text-[clamp(2rem,5vw,3.75rem)] font-bold mb-10 text-[#6E5BFF] leading-tight">
            {siteContent.home.capabilities.heading}
          </h2>
          
          <div className="flex flex-col gap-6 max-w-3xl">
            {siteContent.home.capabilities.items.map((item, idx) => {
              const borderColors = ["border-[#00D9FF]", "border-[#6E5BFF]", "border-[#FF0055]"];
              const margins = ["", "ml-0 md:ml-8", "ml-0 md:ml-16"];
              return (
                <div key={item.title} className={`reveal-text precision-card p-5 sm:p-6 rounded-2xl border-l-4 ${borderColors[idx % borderColors.length]} bg-gradient-to-br from-[#0c1328]/95 via-[#080c1a]/95 to-[#050712]/95 border border-white/10 ${margins[idx % margins.length]} shadow-xl`}>
                  <div className="font-mono text-xs text-[#00D9FF] tracking-widest uppercase mb-1">0{idx + 1}</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[#BFC7D5] text-[clamp(0.95rem,1.1vw,1.05rem)] leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="reveal-text mt-8">
            <a 
              href="/aviation-academy-software" 
              className="precision-link min-h-[44px] text-base font-semibold text-[#00D9FF] inline-flex items-center gap-1.5"
            >
              <span>Explore Aviation Academy Software Modules</span>
              <span className="link-arrow">&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* Chapter 4: Service & Category Offerings */}
      <section className="chapter-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-16 py-20">
        <div className="max-w-6xl w-full pointer-events-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="reveal-text text-xs text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-3">
              Disciplines &amp; Engineering
            </p>
            <h2 className="reveal-text text-[clamp(2rem,5vw,3.75rem)] font-bold text-white mb-4">
              Core Technical Offerings
            </h2>
            <p className="reveal-text text-[#BFC7D5] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Resilient cloud infrastructure, automated workflow pipelines, and custom AI systems tailored to enterprise demands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Cloud Engineering */}
            <div data-spotlight="true" className="reveal-text precision-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-[#0c192e]/95 via-[#081020]/95 to-[#050814]/95 border border-[#00D9FF]/35 shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#00D9FF] tracking-wider uppercase">01 / CLOUD</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30">Infrastructure</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Cloud Engineering</h3>
                <p className="text-sm text-[#BFC7D5] leading-relaxed mb-6 font-light">
                  Fault-tolerant microservices, high-availability edge deployments, and low-latency API architectures engineered for high performance and continuous uptime.
                </p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">Next.js Edge</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">PostgreSQL</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">Zero Downtime</span>
                </div>
                <a href="/services" className="precision-link inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#00D9FF] hover:text-white transition-colors">
                  <span>Explore Cloud Stack</span>
                  <span className="link-arrow">&rarr;</span>
                </a>
              </div>
            </div>

            {/* Card 2: AI Development */}
            <div data-spotlight="true" className="reveal-text precision-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-[#161032]/95 via-[#0e0a22]/95 to-[#080616]/95 border border-[#6E5BFF]/35 shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#A78BFA] tracking-wider uppercase">02 / AI</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#6E5BFF]/10 text-[#A78BFA] border border-[#6E5BFF]/30">Intelligence</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">AI Development</h3>
                <p className="text-sm text-[#BFC7D5] leading-relaxed mb-6 font-light">
                  Custom LLM workflows, automated business reasoning, predictive algorithms, and semantic retrieval systems integrated directly into your operating workflows.
                </p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">LLM Reasoning</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">Vector Indexing</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">Agents</span>
                </div>
                <a href="/services" className="precision-link inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#A78BFA] hover:text-white transition-colors">
                  <span>Explore AI Systems</span>
                  <span className="link-arrow">&rarr;</span>
                </a>
              </div>
            </div>

            {/* Card 3: Automation Systems */}
            <div data-spotlight="true" className="reveal-text precision-card p-6 sm:p-8 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-[#0a1e1a]/95 via-[#071412]/95 to-[#040c0b]/95 border border-[#00FFB2]/35 shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#00FFB2] tracking-wider uppercase">03 / OPS</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#00FFB2]/10 text-[#00FFB2] border border-[#00FFB2]/30">Workflows</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Automation Systems</h3>
                <p className="text-sm text-[#BFC7D5] leading-relaxed mb-6 font-light">
                  Real-time batch tracking, digital record management, student assessment pipelines, and quotation-to-invoice automation tailored to complex business logic.
                </p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">Batch Trace</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">Fee Ledgers</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">Exam Engines</span>
                </div>
                <a href="/services" className="precision-link inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#00FFB2] hover:text-white transition-colors">
                  <span>Explore Automation</span>
                  <span className="link-arrow">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 5: Future Vision & Contact */}
      <section className="chapter-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-center justify-center px-4 py-20">
        <div data-spotlight="true" className="pointer-events-auto text-center bg-gradient-to-br from-[#0c1428]/95 via-[#080d1e]/95 to-[#050714]/95 p-8 sm:p-12 md:p-14 rounded-3xl precision-card border border-[#00D9FF]/30 max-w-3xl shadow-2xl">
          <h2 className="reveal-text text-[clamp(2rem,5vw,3.75rem)] font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-[#D8DFEC] to-[#00D9FF] leading-tight">
            {siteContent.home.cta.heading}
          </h2>
          <p className="reveal-text text-[#BFC7D5] text-[clamp(1rem,1.2vw,1.125rem)] mb-10 leading-relaxed max-w-2xl mx-auto">
            {siteContent.home.cta.description}
          </p>
          <div className="reveal-text flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsContactOpen(true)}
              className="precision-button min-h-[44px] px-8 py-3.5 bg-[#FFFFFF] text-[#050505] font-bold tracking-widest uppercase text-sm rounded-full hover:bg-[#BFC7D5] hover:scale-105 transition-all duration-300 shadow-xl"
            >
              {siteContent.home.cta.primaryButton}
            </button>
            <a 
              href="/services"
              className="precision-button min-h-[44px] px-8 py-3.5 border border-white/25 bg-white/5 text-white font-bold tracking-widest uppercase text-sm rounded-full hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center"
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
