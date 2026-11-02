"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { siteContent } from "@/content/site";

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
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <div id="overlay-container-contact" ref={containerRef} className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between px-8 md:px-24 pointer-events-none pb-24 md:pb-0 pt-28 md:pt-0">
      
      {/* Left side text */}
      <div className="w-full md:w-1/2 mb-10 md:mb-0">
        <h1 className="reveal-elem text-5xl md:text-7xl font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto">
          START A <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#6E5BFF]">
            PROJECT
          </span>
        </h1>
        <p className="reveal-elem text-lg md:text-xl text-[#BFC7D5] max-w-lg mb-8 pointer-events-auto leading-relaxed">
          Tell us about your requirements for an exam portal, fee system, ERP or website. We build software fitted to your business.
        </p>
        <div className="reveal-elem pointer-events-auto space-y-4">
          <div>
            <p className="text-xs text-[#00D9FF] tracking-widest uppercase mb-1 font-mono">Email</p>
            <a href={`mailto:${siteContent.contact.email}`} className="text-xl md:text-2xl text-white hover:text-[#00D9FF] transition-colors">
              {siteContent.contact.email}
            </a>
          </div>
          <div>
            <p className="text-xs text-[#00D9FF] tracking-widest uppercase mb-1 font-mono">Phone</p>
            <a href={`tel:${siteContent.contact.phone.replace(/\s+/g, '')}`} className="text-lg md:text-xl text-white hover:text-[#00D9FF] transition-colors">
              {siteContent.contact.phone}
            </a>
          </div>
          <div>
            <p className="text-xs text-[#00D9FF] tracking-widest uppercase mb-1 font-mono">Location</p>
            <p className="text-base text-[#BFC7D5]">
              {siteContent.contact.address}
            </p>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full md:w-1/2 flex justify-end items-center pointer-events-auto">
        <div className="reveal-elem w-full max-w-md glass-panel p-6 md:p-8 rounded-2xl border border-[#00D9FF]/30 backdrop-blur-xl bg-[#050505]/60">
          {status === "success" ? (
            <div className="h-64 flex flex-col items-center justify-center text-[#00D9FF] text-center px-4">
              <div className="w-12 h-12 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-lg font-bold text-white mb-2">Message Sent</p>
              <p className="text-sm text-[#BFC7D5]">{siteContent.form.successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-[#FFFFFF] mb-2 tracking-wide">
                {siteContent.form.heading}
              </h2>
              <p className="text-xs text-[#BFC7D5] mb-4">
                {siteContent.form.subtitle}
              </p>
              <div className="space-y-3">
                <input 
                  required 
                  type="text" 
                  className="w-full bg-[#050505]/50 border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                  placeholder={siteContent.form.placeholders.name} 
                />
                <input 
                  required 
                  type="email" 
                  className="w-full bg-[#050505]/50 border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                  placeholder={siteContent.form.placeholders.email} 
                />
                <input 
                  type="tel" 
                  className="w-full bg-[#050505]/50 border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                  placeholder={siteContent.form.placeholders.phone} 
                />
                <input 
                  type="text" 
                  className="w-full bg-[#050505]/50 border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                  placeholder={siteContent.form.placeholders.organisation} 
                />
                <select 
                  defaultValue="" 
                  className="w-full bg-[#050505]/50 border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors"
                >
                  <option value="" disabled className="bg-[#050505] text-white/50">{siteContent.form.placeholders.budget}</option>
                  {siteContent.budgetOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#050505] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
                <textarea 
                  required 
                  rows={3} 
                  className="w-full bg-[#050505]/50 border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors resize-none" 
                  placeholder={siteContent.form.placeholders.message} 
                />
              </div>
              <button 
                disabled={status === "submitting"}
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#6E5BFF] to-[#00D9FF] text-[#050505] font-bold tracking-wider uppercase text-sm rounded-lg hover:brightness-125 transition-all duration-300 disabled:opacity-50"
              >
                {status === "submitting" ? siteContent.form.sendingText : siteContent.form.buttonText}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
