"use client";

import { useState } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

export function ContactForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    
    // Simulate API call to Resend / EmailJS
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 3000);
    }, 1500);
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
        "relative w-full max-w-2xl bg-[#0D0D0D]/90 border border-[#BFC7D5]/20 p-8 md:p-12 rounded-3xl shadow-2xl transition-all duration-500 transform",
        isOpen ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
      )}>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#BFC7D5] hover:text-[#00D9FF] transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl md:text-5xl font-bold mb-2 text-[#FFFFFF]">Initiate Sequence</h2>
        <p className="text-[#BFC7D5] mb-8 font-mono">Secure Connection Established.</p>

        {status === "success" ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#00D9FF]">
            <div className="w-16 h-16 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xl font-bold tracking-widest uppercase">Transmission Successful</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#BFC7D5] uppercase tracking-wider">Name</label>
                <input required type="text" className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00D9FF] transition-colors" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#BFC7D5] uppercase tracking-wider">Email</label>
                <input required type="email" className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00D9FF] transition-colors" placeholder="john@example.com" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#BFC7D5] uppercase tracking-wider">Company</label>
                <input type="text" className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00D9FF] transition-colors" placeholder="Your Company" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#BFC7D5] uppercase tracking-wider">Project Budget</label>
                <select className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-3 text-[#BFC7D5] focus:outline-none focus:border-[#00D9FF] transition-colors appearance-none">
                  <option>$50k - $100k</option>
                  <option>$100k - $250k</option>
                  <option>$250k+</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#BFC7D5] uppercase tracking-wider">Message</label>
              <textarea required rows={4} className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00D9FF] transition-colors resize-none" placeholder="Describe your vision..." />
            </div>

            <button 
              disabled={status === "submitting"}
              className="w-full py-4 bg-[#6E5BFF] hover:bg-[#00D9FF] text-white font-bold tracking-[0.2em] uppercase rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {status === "submitting" ? "Transmitting..." : "Send Transmission"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
