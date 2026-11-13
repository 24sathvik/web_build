"use client";

import { useRef } from "react";
import Link from "next/link";
import { siteContent } from "@/content/site";
import { aviationStore, useSelectionStore } from "@/lib/sceneSync";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";

export function AviationOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { hoveredCode, selectedCode } = useSelectionStore(aviationStore);
  const highlightedAuthCode = hoveredCode || selectedCode;

  const { aviation } = siteContent;

  return (
    <div id="overlay-container-aviation" ref={containerRef} className="w-full relative z-10 pointer-events-none pb-32">
      {/* (1) Hero & One-Paragraph Pitch */}
      <section className="aviation-section w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <div className="hero-entrance pointer-events-auto mb-4">
          <Breadcrumbs items={[{ label: "Aviation Academy Software" }]} />
        </div>
        <p className="hero-entrance text-xs md:text-sm text-[#00D9FF] uppercase tracking-[0.3em] font-bold mb-4 pointer-events-auto">
          {aviation.badge}
        </p>
        <h1 className="hero-entrance-delay text-[clamp(2.25rem,6vw,5.5rem)] font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto max-w-5xl leading-tight">
          {aviation.headline}
        </h1>
        <p className="hero-entrance-delay text-[clamp(1.125rem,2vw,1.5rem)] text-[#6E5BFF] font-mono tracking-wide mb-6 pointer-events-auto">
          {aviation.subHeadline}
        </p>
        <p className="hero-entrance-delay-2 text-base sm:text-lg text-[#BFC7D5] max-w-3xl font-light pointer-events-auto leading-relaxed mb-10">
          {aviation.pitch}
        </p>
        <div className="hero-entrance-delay-2 flex flex-wrap gap-4 justify-center pointer-events-auto">
          <Link
            href="/contact"
            className="min-h-[44px] px-8 py-3.5 bg-[#00D9FF] text-black font-bold uppercase tracking-widest text-xs md:text-sm rounded-full hover:bg-white hover:scale-105 transition-all shadow-lg shadow-[#00D9FF]/20 inline-flex items-center"
          >
            Request Academy Demo
          </Link>
          <a
            href="#modules"
            className="min-h-[44px] px-8 py-3.5 border border-white/20 text-white font-bold uppercase tracking-widest text-xs md:text-sm rounded-full hover:bg-white/10 transition-all inline-flex items-center"
          >
            Explore 4 Modules
          </a>
        </div>
      </section>

      {/* (2) The Four Core Modules */}
      <section id="modules" className="aviation-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-16 py-20">
        <div className="max-w-6xl w-full text-center mb-16 pointer-events-auto">
          <p className="reveal-text text-xs text-[#00D9FF] uppercase tracking-widest font-mono mb-2">Systems Architecture</p>
          <h2 className="reveal-text text-[clamp(2rem,5vw,3.75rem)] font-bold text-white mb-4">
            {aviation.modulesTitle}
          </h2>
          <p className="reveal-text text-[#BFC7D5] max-w-2xl mx-auto text-base">
            {aviation.modulesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full pointer-events-auto">
          {aviation.modules.map((mod, idx) => {
            const accents = ["border-[#00D9FF]/30", "border-[#6E5BFF]/30", "border-[#FF0055]/30", "border-[#00FF9D]/30"];
            const titleAccents = ["text-[#00D9FF]", "text-[#6E5BFF]", "text-[#FF0055]", "text-[#00FF9D]"];
            return (
              <div
                key={mod.id}
                className={`reveal-text glass-panel p-6 sm:p-8 rounded-2xl border ${accents[idx % accents.length]} backdrop-blur-xl bg-[#050505]/70 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-white/50">Module 0{idx + 1}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${titleAccents[idx % titleAccents.length]}`}>
                      {mod.subtitle}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">{mod.title}</h3>
                  <p className="text-[#BFC7D5] text-base leading-relaxed mb-6">
                    {mod.description}
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-2">Key Capabilities:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#BFC7D5]">
                    {mod.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF]" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* (3) Built for Each Authority's Rules */}
      <section className="aviation-section content-visibility-auto w-full min-h-[100svh] flex flex-col items-center justify-center px-6 md:px-16 py-20">
        <div className="max-w-6xl w-full text-center mb-16 pointer-events-auto">
          <p className="reveal-text text-xs text-[#6E5BFF] uppercase tracking-widest font-mono mb-2">Regulatory Rule Sets</p>
          <h2 className="reveal-text text-3xl sm:text-5xl font-bold text-white mb-4">
            {aviation.authoritiesTitle}
          </h2>
          <p className="reveal-text text-[#BFC7D5] max-w-2xl mx-auto text-sm sm:text-base">
            {aviation.authoritiesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full pointer-events-auto">
          {aviation.authorities.map((auth) => {
            const isHighlighted = highlightedAuthCode === auth.code;
            return (
              <div
                key={auth.code}
                id={`authority-${auth.code.toLowerCase()}`}
                tabIndex={0}
                onMouseEnter={() => aviationStore.set({ domHoveredCode: auth.code })}
                onMouseLeave={() => aviationStore.set({ domHoveredCode: null })}
                onFocus={() => aviationStore.set({ domHoveredCode: auth.code })}
                onBlur={() => aviationStore.set({ domHoveredCode: null })}
                className={`reveal-text glass-panel p-8 rounded-2xl border backdrop-blur-xl bg-[#050505]/70 flex flex-col justify-between transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] ${
                  isHighlighted
                    ? "border-[#00D9FF]/80 shadow-[0_0_28px_rgba(0,217,255,0.2)]"
                    : "border-white/10 hover:border-[#00D9FF]/45"
                }`}
              >
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-3xl font-bold text-[#00D9FF]">{auth.code}</span>
                  <span className="text-xs uppercase font-mono tracking-widest text-[#BFC7D5]">{auth.region}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{auth.name}</h3>

                <div className="space-y-4 text-xs sm:text-sm text-[#BFC7D5]">
                  <div>
                    <span className="font-semibold text-white block mb-1">Subjects Configured:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-white/70">
                      {auth.subjects.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-white block mb-1">Question Types:</span>
                    <p className="text-white/70 leading-relaxed">{auth.questionTypes.join(", ")}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-white block mb-1">Negative Marking:</span>
                    <p className="text-white/70">{auth.negativeMarking}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-white block mb-1">Timer &amp; Pass Mark:</span>
                    <p className="text-white/70">{auth.timerPassing}</p>
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center max-w-2xl pointer-events-auto">
          <p className="reveal-text text-xs text-white/50 italic font-mono">
            {aviation.regulatorNote}
          </p>
        </div>
      </section>

      {/* (4) For Other Institutes */}
      <section className="aviation-section content-visibility-auto w-full min-h-[80vh] flex flex-col items-center justify-center px-6 md:px-16 py-20">
        <div className="max-w-4xl w-full glass-panel p-8 md:p-12 rounded-3xl border border-[#00D9FF]/20 backdrop-blur-xl bg-[#050505]/80 pointer-events-auto text-center">
          <h2 className="reveal-text text-2xl sm:text-4xl font-bold text-white mb-4">
            {aviation.otherInstitutes.title}
          </h2>
          <p className="reveal-text text-base sm:text-lg text-[#BFC7D5] leading-relaxed mb-8 max-w-2xl mx-auto">
            {aviation.otherInstitutes.description}
          </p>
          <div className="reveal-text grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {aviation.otherInstitutes.types.map((type) => (
              <div key={type} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-[#BFC7D5]">
                <span className="text-[#00D9FF] font-bold mr-2">&#10003;</span>
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Visible DOM FAQs matching FAQPage schema) */}
      <section className="aviation-section content-visibility-auto w-full min-h-[60vh] flex flex-col items-center justify-center px-6 md:px-16 py-20">
        <div className="max-w-4xl w-full pointer-events-auto">
          <div className="text-center mb-12">
            <p className="reveal-text text-xs text-[#00D9FF] uppercase tracking-widest font-mono mb-2">
              Common Inquiries
            </p>
            <h2 className="reveal-text text-3xl sm:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="reveal-text text-[#BFC7D5] max-w-2xl mx-auto text-sm sm:text-base">
              Everything aviation academies, ground schools, and flight training organizations ask about our software.
            </p>
          </div>

          <div className="space-y-4">
            {aviation.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group glass-panel p-6 rounded-2xl border border-white/10 bg-[#050505]/70 open:border-[#00D9FF]/40 transition-colors"
              >
                <summary className="font-semibold text-base sm:text-lg text-white cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{faq.question}</span>
                  <span className="text-[#00D9FF] font-mono transition-transform duration-200 group-open:rotate-45 shrink-0 text-xl">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[#BFC7D5] text-sm sm:text-base leading-relaxed border-t border-white/5 pt-4">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* (5) Call to Action to /contact */}
      <section className="aviation-section content-visibility-auto w-full min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl pointer-events-auto bg-[#050505]/90 p-10 md:p-14 rounded-3xl border border-[#6E5BFF]/30 backdrop-blur-2xl">
          <h2 className="reveal-text text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D9FF] mb-4">
            {aviation.cta.heading}
          </h2>
          <p className="reveal-text text-[#BFC7D5] text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            {aviation.cta.description}
          </p>
          <div className="reveal-text flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-[#6E5BFF] to-[#00D9FF] text-black font-bold uppercase tracking-widest text-sm rounded-full hover:brightness-110 hover:scale-105 transition-all shadow-lg shadow-[#00D9FF]/25"
            >
              {aviation.cta.buttonText}
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {siteContent.contact.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="px-7 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-all"
                >
                  Call {phone}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
