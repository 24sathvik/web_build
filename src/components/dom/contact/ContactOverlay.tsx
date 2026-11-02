"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function ContactOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  useEffect(() => {
    // Reveal animation on load
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".reveal-elem"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: "power3.out" }
      );
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 2000);
  };

  return (
    <div id="overlay-container-contact" ref={containerRef} className="w-full min-h-screen flex items-center justify-between px-8 md:px-24 pointer-events-none pb-24 md:pb-0">
      
      {/* Left side text */}
      <div className="w-full md:w-1/2 mt-20 md:mt-0">
        <h1 className="reveal-elem text-6xl md:text-8xl font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto">
          CROSS THE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#6E5BFF]">HORIZON</span>
        </h1>
        <p className="reveal-elem text-xl text-[#BFC7D5] max-w-lg mb-8 pointer-events-auto">
          Ready to engineer the impossible? Connect with our global architecture team to initiate your next multi-planetary project.
        </p>
        <div className="reveal-elem pointer-events-auto">
          <p className="text-sm text-[#00D9FF] tracking-widest uppercase mb-1">Direct Comms</p>
          <a href="mailto:contact@zyxen.in" className="text-2xl text-white hover:text-[#00D9FF] transition-colors">
            contact@zyxen.in
          </a>
        </div>
      </div>

      {/* Right side form */}
      <div className="hidden md:flex w-full md:w-1/2 justify-end items-center pointer-events-auto">
        <div className="reveal-elem w-full max-w-md glass-panel p-8 rounded-2xl border border-[#00D9FF]/30 backdrop-blur-xl bg-[#050505]/40">
          {status === "success" ? (
            <div className="h-64 flex flex-col items-center justify-center text-[#00D9FF]">
              <div className="w-12 h-12 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-lg font-bold tracking-widest uppercase">Signal Received</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-[#FFFFFF] mb-6 tracking-wide">INITIALIZE SEQUENCE</h2>
              <div className="space-y-4">
                <input required type="text" className="w-full bg-[#050505]/50 border border-[#BFC7D5]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00D9FF] transition-colors" placeholder="Identification (Name)" />
                <input required type="email" className="w-full bg-[#050505]/50 border border-[#BFC7D5]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00D9FF] transition-colors" placeholder="Comms Channel (Email)" />
                <textarea required rows={4} className="w-full bg-[#050505]/50 border border-[#BFC7D5]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00D9FF] transition-colors resize-none" placeholder="Transmission Payload..." />
              </div>
              <button 
                disabled={status === "submitting"}
                className="w-full py-4 bg-gradient-to-r from-[#6E5BFF] to-[#00D9FF] text-[#050505] font-bold tracking-[0.2em] uppercase rounded-lg hover:brightness-125 transition-all duration-300 disabled:opacity-50"
              >
                {status === "submitting" ? "Transmitting..." : "Send Transmission"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
