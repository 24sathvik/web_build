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
        <p className="reveal-text text-sm md:text-base text-[#00D9FF] uppercase tracking-[0.3em] font-bold mb-4 pointer-events-auto">
          The Zyxen Genesis
        </p>
        <h1 className="reveal-text text-5xl md:text-8xl font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto">
          ENGINEERING EMOTION.
        </h1>
        <p className="reveal-text text-xl md:text-2xl text-[#BFC7D5] max-w-2xl font-light pointer-events-auto">
          Born from a defiance of the ordinary. We build digital ecosystems that don't just process data—they command attention.
        </p>
      </section>

      <section className="about-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-2xl pointer-events-auto glass-panel p-8 md:p-12 rounded-2xl">
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-6 text-[#6E5BFF]">Why we Started Zyxen.</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed mb-6">
            ZYXEN wasn't born in a boardroom. It was born in the quiet intensity of a high-stakes engineering lab, fueled by the shared frustration of seeing the web become a desert of generic templates and soul-less automation. We saw a gap between raw power and human elegance. We set out to bridge that void.
          </p>
          <blockquote className="reveal-text border-l-4 border-[#00D9FF] pl-6 py-2 text-xl italic text-white/90">
            "Efficiency is the foundation, but elegance is the standard."
          </blockquote>
        </div>
      </section>

      <section className="about-section w-full min-h-[100vh] flex flex-col items-center justify-center text-center px-4 py-24">
        <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-16 text-[#FFFFFF] pointer-events-auto">
          Our Engineering Pillars
        </h2>
        
        <div className="reveal-text grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full pointer-events-auto">
          <div className="glass-panel p-8 rounded-2xl text-left border border-white/5 hover:border-[#00D9FF]/30 transition-colors">
            <span className="text-[#00D9FF] text-4xl font-bold mb-4 block">01</span>
            <h3 className="text-2xl font-bold text-white mb-4">Invisible Power</h3>
            <p className="text-[#BFC7D5] leading-relaxed">
              High-performance architecture that handles massive scale while remaining completely transparent to the end-user.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl text-left border border-white/5 hover:border-[#6E5BFF]/30 transition-colors">
            <span className="text-[#6E5BFF] text-4xl font-bold mb-4 block">02</span>
            <h3 className="text-2xl font-bold text-white mb-4">Evocative Vision</h3>
            <p className="text-[#BFC7D5] leading-relaxed">
              We design for the human eye and the human heart, prioritizing motion that feels natural and aesthetics that inspire trust.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl text-left border border-white/5 hover:border-[#FF0055]/30 transition-colors">
            <span className="text-[#FF0055] text-4xl font-bold mb-4 block">03</span>
            <h3 className="text-2xl font-bold text-white mb-4">Absolute Speed</h3>
            <p className="text-[#BFC7D5] leading-relaxed">
              Latency is the enemy of experience. We optimize every millisecond to ensure your platform is always ahead of user intent.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
