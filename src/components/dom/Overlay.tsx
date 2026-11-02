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
      {/* Chapter 1: Arrival / Hero */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="reveal-text text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#BFC7D5] mb-6 pointer-events-auto">
          ENGINEERING EXPERIENCES.
        </h1>
        <p className="reveal-text text-xl md:text-3xl text-[#00D9FF] font-mono uppercase tracking-widest pointer-events-auto">
          Innovation Hub 2025
        </p>
        <p className="reveal-text mt-8 text-[#BFC7D5] max-w-2xl text-lg font-light tracking-wide pointer-events-auto mx-auto">
          We architect high-performance digital ecosystems where artificial intelligence meets human elegance.
        </p>
        <div className="reveal-text mt-12 flex gap-6 justify-center pointer-events-auto">
          <button 
            onClick={() => setIsContactOpen(true)}
            className="px-8 py-3 bg-[#00D9FF] text-black font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white hover:scale-105 transition-all"
          >
            Initialize Project
          </button>
          <a href="/projects" className="px-8 py-3 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-all">
            Browse Portfolio
          </a>
        </div>
      </section>

      {/* Chapter 2: The Mission */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-start justify-center px-8 md:px-24">
        <div className="max-w-2xl pointer-events-auto glass-panel p-8 rounded-2xl">
          <p className="reveal-text text-xs text-[#00D9FF] uppercase tracking-[0.3em] font-bold mb-4">The Zyxen Standard</p>
          <h2 className="reveal-text text-3xl md:text-5xl font-bold mb-6">
            Bridging the gap between raw computing power and human-centric design.
          </h2>
          <p className="reveal-text text-[#BFC7D5] text-lg leading-relaxed">
            Most software forces a compromise: it is either lightning-fast but visually uninspiring, or stunningly beautiful but structurally fragile. At Zyxen, we engineer digital platforms that refuse to compromise. We build enterprise-grade software that scales infinitely while delivering sensory, emotionally resonant user experiences.
          </p>
        </div>
      </section>

      {/* Chapter 3: Core Capabilities */}
      <section className="chapter-section w-full h-[100vh] flex flex-col justify-center px-8 md:px-24">
        <div className="pointer-events-auto">
          <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-12 text-[#6E5BFF]">Capabilities</h2>
          
          <div className="flex flex-col gap-8 max-w-3xl">
            <div className="reveal-text border-l-2 border-[#00D9FF] pl-6">
              <h3 className="text-2xl font-bold text-white mb-2">Neural Automation</h3>
              <p className="text-[#BFC7D5]">Embedding AI workflows that transform complex enterprise processes into frictionless operations.</p>
            </div>
            
            <div className="reveal-text border-l-2 border-[#6E5BFF] pl-6 ml-0 md:ml-12">
              <h3 className="text-2xl font-bold text-white mb-2">Elastic Infrastructure</h3>
              <p className="text-[#BFC7D5]">Cloud-native, highly available systems designed for absolute uptime and seamless global scaling.</p>
            </div>
            
            <div className="reveal-text border-l-2 border-[#FF0055] pl-6 ml-0 md:ml-24">
              <h3 className="text-2xl font-bold text-white mb-2">Sensory UI/UX</h3>
              <p className="text-[#BFC7D5]">Visual languages and motion protocols that communicate authority and inspire absolute brand loyalty.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 4: Future Vision & Contact */}
      <section className="chapter-section w-full h-[100vh] flex flex-col items-center justify-center px-4">
        <div className="pointer-events-auto text-center bg-[#050505]/80 p-12 rounded-3xl backdrop-blur-md border border-[#00D9FF]/20 max-w-3xl">
          <h2 className="reveal-text text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D9FF]">
            LET'S BUILD THE FUTURE TOGETHER.
          </h2>
          <p className="reveal-text text-[#BFC7D5] text-lg mb-10">
            Don't let legacy systems dictate your growth. Partner with Zyxen to architect the intelligent infrastructure your brand deserves.
          </p>
          <div className="reveal-text flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsContactOpen(true)}
              className="px-8 py-4 bg-[#FFFFFF] text-[#050505] font-bold tracking-widest uppercase text-sm rounded-full hover:bg-[#BFC7D5] hover:scale-105 transition-all duration-300"
            >
              Start an Enquiry
            </button>
            <a 
              href="/services"
              className="px-8 py-4 border border-white/20 text-white font-bold tracking-widest uppercase text-sm rounded-full hover:bg-white/10 transition-all duration-300 inline-block"
            >
              View Capabilities
            </a>
          </div>
        </div>
      </section>

      <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
