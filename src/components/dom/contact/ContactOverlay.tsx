"use client";

import dynamic from "next/dynamic";
import { siteContent } from "@/content/site";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";

function ContactFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      <div>
        <div className="h-8 w-48 bg-white/10 rounded mb-2" />
        <div className="h-4 w-72 bg-white/5 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="h-11 bg-white/5 rounded-lg" />
        <div className="h-11 bg-white/5 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-11 bg-white/5 rounded-lg" />
        <div className="h-11 bg-white/5 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="h-11 bg-white/5 rounded-lg" />
        <div className="h-11 bg-white/5 rounded-lg" />
      </div>
      <div className="h-20 bg-white/5 rounded-lg" />
      <div className="h-11 bg-white/15 rounded-lg" />
    </div>
  );
}

const ContactFormView = dynamic(
  () => import("./ContactFormView").then((m) => m.ContactFormView),
  {
    ssr: false,
    loading: () => <ContactFormSkeleton />,
  }
);

export function ContactOverlay() {
  return (
    <div
      id="overlay-container-contact"
      className="w-full min-h-[100svh] flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 lg:px-24 pointer-events-none pb-28 lg:pb-16 pt-24 lg:pt-16 gap-10"
    >
      {/* Left side text */}
      <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
        <div className="hero-entrance pointer-events-auto mb-4">
          <Breadcrumbs items={[{ label: "Contact" }]} />
        </div>
        <p className="hero-entrance text-xs md:text-sm text-[#00D9FF] uppercase tracking-[0.3em] font-mono font-bold mb-3 pointer-events-auto">
          Direct Engineering Inquiry
        </p>
        <h1 className="hero-entrance-delay text-5xl md:text-7xl font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto leading-tight">
          START A <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#6E5BFF]">
            PROJECT
          </span>
        </h1>
        <p className="hero-entrance-delay-2 text-base md:text-lg text-[#BFC7D5] max-w-lg mb-8 pointer-events-auto leading-relaxed">
          Tell us about your requirements for an exam portal, fee system, ERP or website. We build software fitted to your business.
        </p>

        <div className="hero-entrance-delay-2 pointer-events-auto space-y-5 border-t border-white/10 pt-6">
          <div>
            <p className="text-xs text-[#00D9FF] tracking-widest uppercase mb-1 font-mono">Email</p>
            <a
              href={`mailto:${siteContent.contact.email}`}
              className="min-h-[44px] inline-flex items-center text-lg md:text-xl text-white hover:text-[#00D9FF] transition-colors font-medium"
            >
              {siteContent.contact.email}
            </a>
          </div>
          <div>
            <p className="text-xs text-[#00D9FF] tracking-widest uppercase mb-1 font-mono">Phone</p>
            <div className="flex flex-col gap-1.5">
              {siteContent.contact.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="min-h-[44px] inline-flex items-center text-lg md:text-xl text-white hover:text-[#00D9FF] transition-colors font-medium w-fit"
                >
                  {phone}
                </a>
              ))}
            </div>
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
        <div className="hero-entrance-delay-2 w-full max-w-lg precision-card p-6 md:p-8 rounded-3xl border border-[#00D9FF]/30 bg-[#050505]/75 shadow-2xl">
          <ContactFormView />
        </div>
      </div>
    </div>
  );
}
