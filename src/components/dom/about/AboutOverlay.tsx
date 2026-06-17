"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

  return (
    <div id="overlay-container-about" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      <section className="about-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="reveal-text text-5xl md:text-8xl font-bold tracking-tighter text-[#FFFFFF] mb-4 pointer-events-auto">
          THE ORIGIN
        </h1>
        <p className="reveal-text text-xl md:text-2xl text-[#00D9FF] font-mono tracking-widest pointer-events-auto">
          Tracing back to the singularity of innovation.
        </p>
      </section>

      <section className="about-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl">
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-6 text-[#6E5BFF]">Our Mission</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed">
            ZYXEN was founded on the belief that software architecture should be as elegant as the laws of physics. 
            We build digital universes that empower human potential, bridging the gap between theoretical computing and practical reality.
          </p>
        </div>
      </section>

      <section className="about-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-8 text-[#FFFFFF] pointer-events-auto">
          Welcome to the Future.
        </h2>
      </section>
    </div>
  );
}
