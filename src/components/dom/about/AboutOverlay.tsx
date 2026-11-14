"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { siteContent } from "@/content/site";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";

export function AboutOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let cancelled = false;
    let initialized = false;
    const scroller = document.getElementById("scroll-container-about");

    const initAnimations = () => {
      if (cancelled || initialized) return;
      initialized = true;
      cleanupListeners();

      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
        ([{ default: gsap }, { ScrollTrigger }]) => {
          if (cancelled) return;
          gsap.registerPlugin(ScrollTrigger);
          ScrollTrigger.config({ ignoreMobileResize: true });

          const sections = gsap.utils.toArray(".about-section") as HTMLElement[];
          sections.slice(1).forEach((section) => {
            const texts = section.querySelectorAll(".reveal-text");
            gsap.fromTo(
              texts,
              { scale: 0.8, opacity: 0, filter: "blur(10px)" },
              {
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                duration: 1.5,
                stagger: 0.3,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: section,
                  scroller: "#scroll-container-about",
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

    const cleanupListeners = () => {
      scroller?.removeEventListener("scroll", initAnimations);
      window.removeEventListener("wheel", initAnimations);
      window.removeEventListener("touchstart", initAnimations);
      window.removeEventListener("keydown", initAnimations);
    };

    if (scroller && scroller.scrollTop > 0) {
      initAnimations();
    } else {
      scroller?.addEventListener("scroll", initAnimations, { passive: true, once: true });
      window.addEventListener("wheel", initAnimations, { passive: true, once: true });
      window.addEventListener("touchstart", initAnimations, { passive: true, once: true });
      window.addEventListener("keydown", initAnimations, { passive: true, once: true });
    }

    return () => {
      cancelled = true;
      cleanupListeners();
    };
  }, []);

  const borderColors = [
    "hover:border-[#00D9FF]/40 border-white/10",
    "hover:border-[#6E5BFF]/40 border-white/10",
    "hover:border-[#FF0055]/40 border-white/10",
  ];
  const textColors = ["text-[#00D9FF]", "text-[#6E5BFF]", "text-[#FF0055]"];

  return (
    <div id="overlay-container-about" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      {/* Chapter 1: Introduction */}
      <section className="about-section w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="hero-entrance pointer-events-auto mb-6">
          <Breadcrumbs items={[{ label: "About" }]} />
        </div>
        <p className="hero-entrance text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-4 pointer-events-auto">
          {siteContent.about.tag}
        </p>
        <h1 className="hero-entrance-delay text-5xl md:text-7xl font-extrabold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto">
          {siteContent.about.headline}
        </h1>
        <p className="hero-entrance-delay-2 text-base md:text-xl text-[#BFC7D5] max-w-2xl font-light leading-relaxed pointer-events-auto">
          {siteContent.about.intro}
        </p>
      </section>

      {/* Chapter 2: The Philosophy */}
      <section className="about-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-start justify-center px-6 md:px-24 py-20">
        <h2 className="reveal-text text-3xl md:text-5xl font-bold tracking-tight text-[#FFFFFF] mb-8 border-l-4 border-[#00D9FF] pl-6 pointer-events-auto">
          {siteContent.about.storyTitle}
        </h2>
        <p className="reveal-text text-lg md:text-2xl text-[#BFC7D5] max-w-3xl font-light leading-relaxed mb-12 pointer-events-auto">
          {siteContent.about.storyBody}
        </p>
        <blockquote className="reveal-text border-l-2 border-[#6E5BFF] pl-6 text-[#FFFFFF] italic text-xl md:text-2xl font-serif max-w-2xl pointer-events-auto">
          &ldquo;{siteContent.about.quote}&rdquo;
        </blockquote>
      </section>

      {/* Chapter 3: Pillars */}
      <section className="about-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4 py-24">
        <h2 className="reveal-text text-3xl md:text-5xl font-bold tracking-tight text-[#FFFFFF] mb-16 pointer-events-auto">
          {siteContent.about.pillarsTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full pointer-events-auto">
          {siteContent.about.pillars.map((pillar, idx) => (
            <div
              key={pillar.number}
              className={`glass-panel p-6 md:p-8 rounded-2xl text-left border ${borderColors[idx % borderColors.length]} transition-colors backdrop-blur-md`}
            >
              <div className={`text-4xl font-mono font-bold ${textColors[idx % textColors.length]} mb-4`}>
                {pillar.number}
              </div>
              <h3 className="text-xl font-bold text-[#FFFFFF] mb-3">{pillar.title}</h3>
              <p className="text-sm md:text-base text-[#BFC7D5] font-light leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-16 pointer-events-auto">
          <Link
            href="/services"
            className="inline-flex min-h-[44px] items-center gap-2 px-8 py-3 rounded-full bg-[#00D9FF] text-black font-semibold uppercase tracking-wider text-sm hover:bg-white transition-colors duration-300"
          >
            Explore What We Build
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
