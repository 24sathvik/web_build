"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import clsx from "clsx";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { siteContent } from "@/content/site";
import { useContactForm } from "@/hooks/useContactForm";

export function ContactOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    formData,
    errors,
    errorMessage,
    handleChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    isSuccess,
    isError,
  } = useContactForm();

  useEffect(() => {
    // Reveal animation on load
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".reveal-elem"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div
      id="overlay-container-contact"
      ref={containerRef}
      className="w-full min-h-screen flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 lg:px-24 pointer-events-none pb-24 lg:pb-12 pt-28 lg:pt-16 gap-12"
    >
      {/* Left side text */}
      <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
        <p className="reveal-elem text-xs md:text-sm text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-3 pointer-events-auto">
          Direct Engineering Inquiry
        </p>
        <h1 className="reveal-elem text-5xl md:text-7xl font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto leading-tight">
          START A <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#6E5BFF]">
            PROJECT
          </span>
        </h1>
        <p className="reveal-elem text-base md:text-lg text-[#BFC7D5] max-w-lg mb-8 pointer-events-auto leading-relaxed">
          Tell us about your requirements for an exam portal, fee system, ERP or website. We build software fitted to your business.
        </p>
        
        <div className="reveal-elem pointer-events-auto space-y-5 border-t border-white/10 pt-6">
          <div>
            <p className="text-xs text-[#00D9FF] tracking-widest uppercase mb-1 font-mono">Email</p>
            <a
              href={`mailto:${siteContent.contact.email}`}
              className="text-lg md:text-xl text-white hover:text-[#00D9FF] transition-colors font-medium"
            >
              {siteContent.contact.email}
            </a>
          </div>
          <div>
            <p className="text-xs text-[#00D9FF] tracking-widest uppercase mb-1 font-mono">Phone</p>
            <a
              href={`tel:${siteContent.contact.phone.replace(/\s+/g, "")}`}
              className="text-lg md:text-xl text-white hover:text-[#00D9FF] transition-colors font-medium"
            >
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
      <div className="w-full lg:w-1/2 flex justify-end items-center pointer-events-auto">
        <div className="reveal-elem w-full max-w-lg glass-panel p-6 md:p-8 rounded-3xl border border-[#00D9FF]/30 backdrop-blur-xl bg-[#050505]/75 shadow-2xl">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Message Sent</h2>
              <p className="text-sm text-[#BFC7D5] max-w-sm mb-8 leading-relaxed">
                {siteContent.form.successMessage}
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs font-mono uppercase tracking-wider hover:bg-white/90 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#FFFFFF] mb-1 tracking-wide">
                  {siteContent.form.heading}
                </h2>
                <p className="text-xs text-[#BFC7D5] leading-relaxed">
                  {siteContent.form.subtitle}
                </p>
              </div>

              {/* Honeypot field for bot spam prevention */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.honeypot}
                  onChange={handleChange}
                />
              </div>

              {/* Error Banner */}
              {isError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start gap-3">
                  <AlertCircle className="shrink-0 text-red-400 mt-0.5" size={16} />
                  <div className="space-y-1">
                    <p className="font-semibold text-white">Message could not be sent</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#BFC7D5] uppercase tracking-wider">
                    Name <span className="text-[#00D9FF]">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={clsx(
                      "w-full bg-[#050505]/60 border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none transition-colors",
                      errors.name ? "border-red-500/60 focus:border-red-500" : "border-[#BFC7D5]/20 focus:border-[#00D9FF]"
                    )}
                    placeholder={siteContent.form.placeholders.name} 
                  />
                  {errors.name && <p className="text-[10px] text-red-400 font-mono">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#BFC7D5] uppercase tracking-wider">
                    Email <span className="text-[#00D9FF]">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={clsx(
                      "w-full bg-[#050505]/60 border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none transition-colors",
                      errors.email ? "border-red-500/60 focus:border-red-500" : "border-[#BFC7D5]/20 focus:border-[#00D9FF]"
                    )}
                    placeholder={siteContent.form.placeholders.email} 
                  />
                  {errors.email && <p className="text-[10px] text-red-400 font-mono">{errors.email}</p>}
                </div>
              </div>

              {/* Phone & Organisation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#BFC7D5] uppercase tracking-wider">Phone</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#050505]/60 border border-[#BFC7D5]/20 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                    placeholder={siteContent.form.placeholders.phone} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#BFC7D5] uppercase tracking-wider">Organisation</label>
                  <input 
                    type="text" 
                    name="organisation"
                    value={formData.organisation}
                    onChange={handleChange}
                    className="w-full bg-[#050505]/60 border border-[#BFC7D5]/20 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                    placeholder={siteContent.form.placeholders.organisation} 
                  />
                </div>
              </div>

              {/* Interested In & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#BFC7D5] uppercase tracking-wider">Interested In</label>
                  <select 
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full bg-[#050505]/60 border border-[#BFC7D5]/20 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#050505] text-white/50">Select a capability</option>
                    {siteContent.services.map((svc) => (
                      <option key={svc.id} value={svc.name} className="bg-[#050505] text-white">
                        {svc.name}
                      </option>
                    ))}
                    <option value="Custom Project" className="bg-[#050505] text-white">Other / Custom Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#BFC7D5] uppercase tracking-wider">Estimated Budget</label>
                  <select 
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full bg-[#050505]/60 border border-[#BFC7D5]/20 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#050505] text-white/50">{siteContent.form.placeholders.budget}</option>
                    {siteContent.budgetOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#050505] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#BFC7D5] uppercase tracking-wider">
                  Message <span className="text-[#00D9FF]">*</span>
                </label>
                <textarea 
                  rows={3} 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={clsx(
                    "w-full bg-[#050505]/60 border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none transition-colors resize-none",
                    errors.message ? "border-red-500/60 focus:border-red-500" : "border-[#BFC7D5]/20 focus:border-[#00D9FF]"
                  )}
                  placeholder={siteContent.form.placeholders.message} 
                />
                {errors.message && <p className="text-[10px] text-red-400 font-mono">{errors.message}</p>}
              </div>

              {/* Submit Button */}
              <button 
                disabled={isSubmitting}
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#6E5BFF] to-[#00D9FF] text-[#050505] font-bold tracking-wider uppercase text-xs font-mono rounded-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin text-black" size={16} />
                    <span>{siteContent.form.sendingText}</span>
                  </>
                ) : (
                  <span>{siteContent.form.buttonText} &rarr;</span>
                )}
              </button>

              {/* Visible Fallback */}
              <div className="pt-2 text-center border-t border-white/10 mt-3">
                <p className="text-xs text-[#BFC7D5]">
                  Or email directly:{" "}
                  <a
                    href={`mailto:${siteContent.contact.email}`}
                    className="text-[#00D9FF] hover:underline font-mono font-medium"
                  >
                    {siteContent.contact.email}
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
