"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "@/content/site";

gsap.registerPlugin(ScrollTrigger);

export function AboutOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = gsap.utils.toArray(".about-section") as HTMLElement[];
    sections.forEach((section) => {
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
  }, []);

  const borderColors = [
    "hover:border-[#00D9FF]/40 border-white/10",
    "hover:border-[#6E5BFF]/40 border-white/10",
    "hover:border-[#FF0055]/40 border-white/10",
  ];
  const textColors = ["text-[#00D9FF]", "text-[#6E5BFF]", "text-[#FF0055]"];

  return (
    <div id="overlay-container-about" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      <section className="about-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <p className="reveal-text text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-4 pointer-events-auto">
          {siteContent.about.tag}
        </p>
        <h1 className="reveal-text text-5xl md:text-8xl font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto">
          {siteContent.about.headline}
        </h1>
        <p className="reveal-text text-xl md:text-2xl text-[#BFC7D5] max-w-2xl font-light pointer-events-auto leading-relaxed">
          {siteContent.about.intro}
        </p>
      </section>

      <section className="about-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-2xl pointer-events-auto glass-panel p-8 md:p-12 rounded-2xl border border-white/10">
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-6 text-[#6E5BFF]">
            {siteContent.about.storyTitle}
          </h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed mb-6">
            {siteContent.about.storyBody}
          </p>
          <blockquote className="reveal-text border-l-4 border-[#00D9FF] pl-6 py-2 text-xl italic text-white/90">
            &ldquo;{siteContent.about.quote}&rdquo;
          </blockquote>
        </div>
      </section>

      <section className="about-section w-full min-h-[100vh] flex flex-col items-center justify-center text-center px-4 py-24">
        <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-16 text-[#FFFFFF] pointer-events-auto">
          {siteContent.about.pillarsTitle}
        </h2>

        <div className="reveal-text grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full pointer-events-auto">
          {siteContent.about.pillars.map((pillar, idx) => (
            <div
              key={pillar.title}
              className={`glass-panel p-8 rounded-2xl text-left border ${borderColors[idx % borderColors.length]} transition-colors backdrop-blur-md`}
            >
              <span className={`${textColors[idx % textColors.length]} text-4xl font-bold font-mono mb-4 block`}>
                {pillar.number}
              </span>
              <h3 className="text-2xl font-bold text-white mb-4">{pillar.title}</h3>
              <p className="text-[#BFC7D5] leading-relaxed text-sm md:text-base">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        <div className="reveal-text mt-16 pointer-events-auto">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg shadow-white/10"
          >
            Start a Project with ZYXEN &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
