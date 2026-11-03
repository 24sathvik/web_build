"use client";

import clsx from "clsx";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { siteContent } from "@/content/site";
import { useContactForm } from "@/hooks/useContactForm";

export function ContactForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

    const handleClose = () => {
      resetForm();
      onClose();
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
          onClick={handleClose}
        />

        <div className={clsx(
          "relative w-full max-w-2xl bg-[#0D0D0D]/95 border border-[#BFC7D5]/20 p-6 md:p-10 rounded-3xl shadow-2xl transition-all duration-500 transform max-h-[90vh] overflow-y-auto",
          isOpen ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
        )}>
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-[#BFC7D5] hover:text-[#00D9FF] transition-colors p-1"
            aria-label="Close"
            type="button"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl md:text-4xl font-bold mb-2 text-[#FFFFFF]">{siteContent.form.heading}</h2>
          <p className="text-[#BFC7D5] mb-6 text-sm">{siteContent.form.subtitle}</p>

              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                    <CheckCircle2 size={36} />
                  </div>
                  <p className="text-xl font-bold text-white mb-2">Message Sent</p>
                  <p className="text-sm text-[#BFC7D5] max-w-md mb-8">{siteContent.form.successMessage}</p>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-mono uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
                    >
                      Send Another
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs font-mono uppercase tracking-wider hover:bg-white/90 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">
                          Name <span className="text-[#00D9FF]">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={clsx(
                            "w-full bg-[#050505] border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors",
                            errors.name ? "border-red-500/60 focus:border-red-500" : "border-[#BFC7D5]/20 focus:border-[#00D9FF]"
                          )}
                          placeholder={siteContent.form.placeholders.name}
                        />
                        {errors.name && <p className="text-[11px] text-red-400 font-mono">{errors.name}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">
                          Email <span className="text-[#00D9FF]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={clsx(
                            "w-full bg-[#050505] border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors",
                            errors.email ? "border-red-500/60 focus:border-red-500" : "border-[#BFC7D5]/20 focus:border-[#00D9FF]"
                          )}
                          placeholder={siteContent.form.placeholders.email}
                        />
                        {errors.email && <p className="text-[11px] text-red-400 font-mono">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Phone & Organisation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors"
                          placeholder={siteContent.form.placeholders.phone}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Organisation / Academy</label>
                        <input
                          type="text"
                          name="organisation"
                          value={formData.organisation}
                          onChange={handleChange}
                          className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors"
                          placeholder={siteContent.form.placeholders.organisation}
                        />
                      </div>
                    </div>

                      {/* Interested In (Service) & Budget */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Interested In</label>
                          <select
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors appearance-none"
                          >
                            <option value="" className="bg-[#050505] text-white/50">Select a capability / service</option>
                            {siteContent.services.map((svc) => (
                              <option key={svc.id} value={svc.name} className="bg-[#050505] text-white">
                                {svc.name}
                              </option>
                            ))}
                            <option value="Custom Project" className="bg-[#050505] text-white">Other / Custom Inquiry</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">Estimated Budget (INR)</label>
                          <select
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            className="w-full bg-[#050505] border border-[#BFC7D5]/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D9FF] transition-colors appearance-none"
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
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#BFC7D5] uppercase tracking-wider">
                          Message <span className="text-[#00D9FF]">*</span>
                        </label>
                        <textarea
                          rows={3}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          className={clsx(
                            "w-full bg-[#050505] border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none",
                            errors.message ? "border-red-500/60 focus:border-red-500" : "border-[#BFC7D5]/20 focus:border-[#00D9FF]"
                          )}
                          placeholder={siteContent.form.placeholders.message}
                        />
                        {errors.message && <p className="text-[11px] text-red-400 font-mono">{errors.message}</p>}
                      </div>

                      {/* Submit Button */}
                      <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full py-3.5 bg-[#6E5BFF] hover:bg-[#00D9FF] text-white hover:text-black font-bold tracking-wider uppercase text-sm rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            <span>{siteContent.form.sendingText}</span>
                          </>
                        ) : (
                          <span>{siteContent.form.buttonText}</span>
                        )}
                      </button>

                      {/* Visible Fallback */}
                      <div className="pt-2 text-center">
                        <p className="text-xs text-[#BFC7D5]/80">
                          Prefer direct email? Reach us at{" "}
                          <a
                            href={`mailto:${siteContent.contact.email}`}
                            className="text-[#00D9FF] hover:underline font-medium"
                          >
                            {siteContent.contact.email}
                          </a>
                        </p>
                      </div>
                  </form>
        )}
                </div>
    </div>
          );
}
