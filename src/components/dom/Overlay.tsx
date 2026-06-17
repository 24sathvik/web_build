"use client";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContactForm } from "./ContactForm";

gsap.registerPlugin(ScrollTrigger);

export function Overlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    // Reveal animations for text on scroll
    const sections = gsap.utils.toArray(".chapter-section") as HTMLElement[];
    sections.forEach((section) => {
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
  }, []);

  return (
    <div id="overlay-container" ref={containerRef} className="w-full relative z-10 pointer-events-none">
      {/* Chapter 1: Arrival */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="reveal-text text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#BFC7D5] mb-6 pointer-events-auto">
          ZYXEN
        </h1>
        <p className="reveal-text text-xl md:text-3xl text-[#00D9FF] font-mono uppercase tracking-widest pointer-events-auto">
          Engineering Tomorrow's Digital Universe
        </p>
        <p className="reveal-text mt-8 text-[#BFC7D5] max-w-2xl text-lg font-light tracking-wide pointer-events-auto">
          AI • Automation • Cloud • Software
        </p>
      </section>

      {/* Chapter 2: The Technology Core */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-xl pointer-events-auto glass-panel p-8 rounded-2xl">
          <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-6">The Core</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed">
            Our technology stack is built on a foundation of performance and infinite scalability. 
            We engineer solutions that adapt, evolve, and power the next generation of global infrastructure.
          </p>
        </div>
      </section>

      {/* Chapter 3: Innovation Ecosystem */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-end justify-center px-8 md:px-24">
        <div className="max-w-xl text-right pointer-events-auto">
          <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-6 text-[#6E5BFF]">Ecosystem</h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed">
            A seamlessly connected network of products, services, and digital infrastructure.
            Data flows effortlessly across boundaries, creating a holistic technological universe.
          </p>
        </div>
      </section>

      {/* Chapter 4: Capabilities */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-center justify-start pt-32 px-4">
        <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-6 text-center pointer-events-auto">
          Capabilities
        </h2>
        <p className="reveal-text text-[#BFC7D5] text-center max-w-2xl pointer-events-auto">
          Scroll to explore our holographic service nodes.
        </p>
      </section>

      {/* Chapter 5: Future Vision & Contact */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-center justify-center px-4">
        <div className="pointer-events-auto text-center bg-[#050505]/80 p-12 rounded-3xl backdrop-blur-md border border-[#0D0D0D]">
          <h2 className="reveal-text text-5xl md:text-7xl font-bold mb-8 text-[#00D9FF]">
            Build The Future
          </h2>
          <button 
            onClick={() => setIsContactOpen(true)}
            className="reveal-text px-8 py-4 bg-[#FFFFFF] text-[#050505] font-bold tracking-widest uppercase rounded-full hover:bg-[#BFC7D5] hover:scale-105 transition-all duration-300"
          >
            Initiate Contact
          </button>
        </div>
      </section>

      <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
