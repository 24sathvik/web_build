"use client";

import { useState } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { siteContent } from "@/content/site";

export function ContactForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 2500);
    }, 1200);
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-500",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div 
        className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div className={clsx(
        "relative w-full max-w-2xl bg-[#0D0D0D]/95 border border-[#BFC7D5]/20 p-6 md:p-10 rounded-3xl shadow-2xl transition-all duration-500 transform max-h-[90vh] overflow-y-auto",
        isOpen ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
      )}>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#BFC7D5] hover:text-[#00D9FF] transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl md:text-4xl font-bold mb-2 text-[#FFFFFF]">{siteContent.form.heading}</h2>
        <p className="text-[#BFC7D5] mb-6 text-sm">{siteContent.form.subtitle}</p>

        {status === "success" ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#00D9FF] text-center px-4">
            <div className="w-14 h-14 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg font-bold text-white mb-2">Message Received</p>
            <p className="text-sm text-[#BFC7D5]">{siteContent.form.successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Name *</label>
                <input 
                  required 
                  type="text" 
                  className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                  placeholder={siteContent.form.placeholders.name} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Email *</label>
                <input 
                  required 
                  type="email" 
                  className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                  placeholder={siteContent.form.placeholders.email} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Phone</label>
                <input 
                  type="tel" 
                  className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                  placeholder={siteContent.form.placeholders.phone} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Organisation</label>
                <input 
                  type="text" 
                  className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors" 
                  placeholder={siteContent.form.placeholders.organisation} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Estimated Budget (INR)</label>
              <select 
                defaultValue="" 
                className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-[#BFC7D5] focus:outline-none focus:border-[#00D9FF] transition-colors appearance-none"
              >
                <option value="" disabled className="bg-[#050505] text-white/50">{siteContent.form.placeholders.budget}</option>
                {siteContent.budgetOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#050505] text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Message *</label>
              <textarea 
                required 
                rows={3} 
                className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors resize-none" 
                placeholder={siteContent.form.placeholders.message} 
              />
            </div>

            <button 
              disabled={status === "submitting"}
              type="submit"
              className="w-full py-3.5 bg-[#6E5BFF] hover:bg-[#00D9FF] text-white hover:text-black font-bold tracking-wider uppercase text-sm rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {status === "submitting" ? siteContent.form.sendingText : siteContent.form.buttonText}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
