import Link from "next/link";
import { siteContent } from "@/content/site";
import { CONTACT_EMAIL, SOCIALS } from "@/lib/site";
import { BackToTopButton } from "@/components/dom/BackToTopButton";

function getSocialMeta(url: string) {
  if (url.includes("instagram")) {
    return {
      label: "ZYXEN on Instagram",
      path: (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </>
      ),
      isFilled: false,
    };
  }
  if (url.includes("x.com") || url.includes("twitter.com")) {
    return {
      label: "ZYXEN on X",
      path: (
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      ),
      isFilled: true,
    };
  }
  if (url.includes("linkedin")) {
    return {
      label: "ZYXEN on LinkedIn",
      path: (
        <>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </>
      ),
      isFilled: false,
    };
  }
  return {
    label: "ZYXEN on Facebook",
    path: (
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    ),
    isFilled: false,
  };
}

const serviceLinks = [
  { label: "All Services", href: "/services" },
  { label: "Custom Web", href: "/services" },
  { label: "Pharma Systems", href: "/projects#pharma-quotation-system" },
  { label: "ZyOps & Flow", href: "/projects#zyops" },
];

const aviationLinks = [
  { label: "Aviation Software", href: "/aviation-academy-software" },
  { label: "Exam Modules", href: "/aviation-academy-software#modules" },
  { label: "Aviation Systems", href: "/projects#aviation-systems" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

const resourceLinks = [
  { label: "Blogs", href: "/blogs" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <>
      <footer
        aria-label="Site footer"
        id="site-footer"
        className="relative z-20 pointer-events-auto border-t border-[#00D9FF]/20 bg-gradient-to-b from-[#07080f] via-[#050508] to-[#030305] text-white"
      >
      {/* Glowing top divider hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00D9FF]/80 to-transparent shadow-[0_0_12px_rgba(0,217,255,0.4)]"
      />

      <div className="mx-auto max-w-[1200px] px-3.5 sm:px-6 md:px-8 py-3.5 sm:py-5 md:py-6">
        {/* Compact Top CTA Strip */}
        <div className="mb-3 sm:mb-4 rounded-xl border border-white/10 bg-gradient-to-r from-[#00D9FF]/[0.07] via-[#6E5BFF]/[0.05] to-white/[0.02] px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="max-w-xl">
            <p className="text-xs sm:text-sm font-semibold text-white tracking-tight">
              Ready to build your web platform, exam portal, or enterprise software?
            </p>
            <p className="text-[11px] text-[#BFC7D5] hidden sm:block">
              Speak directly with the ZYXEN engineering team in Hyderabad.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/contact"
              prefetch={false}
              className="min-h-[40px] inline-flex items-center justify-center rounded-full bg-[#00D9FF] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-white transition-colors"
            >
              Start a project
            </Link>
            <Link
              href="/projects"
              prefetch={false}
              className="min-h-[40px] inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
            >
              View work
            </Link>
          </div>
        </div>

        {/* Brand & Direct Contact Row (Mobile compact header / Desktop integrated) */}
        <div className="flex flex-col md:hidden pb-2.5 mb-2.5 border-b border-white/10 gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                prefetch={false}
                className="inline-flex items-center min-h-[40px] min-w-[44px] text-xl font-bold tracking-tighter text-white hover:text-[#00D9FF] transition-colors"
              >
                ZYXEN
              </Link>
              <span className="text-[10px] font-mono uppercase text-[#BFC7D5]">
                Hyderabad
              </span>
            </div>
            {/* Social Icons on Mobile */}
            <div className="flex flex-wrap items-center gap-1.5">
              {SOCIALS.map((url) => {
                const social = getSocialMeta(url);
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="shrink-0 w-10 h-10 min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-[#BFC7D5] hover:border-[#00D9FF]/60 hover:text-[#00D9FF] transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={social.isFilled ? "currentColor" : "none"}
                      stroke={social.isFilled ? "none" : "currentColor"}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {social.path}
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#BFC7D5]">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="min-h-[40px] inline-flex items-center text-white hover:text-[#00D9FF] transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
            <span className="text-white/20">|</span>
            <a
              href={`tel:${siteContent.contact.phones[0].replace(/\s+/g, "")}`}
              className="min-h-[40px] inline-flex items-center text-white hover:text-[#00D9FF] transition-colors"
            >
              {siteContent.contact.phones[0]}
            </a>
          </div>
        </div>

        {/* 4 Link Columns (Services, Aviation, Company, Resources) + 5th Contact Column on Desktop */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4 md:gap-6 pb-3 border-b border-white/10">
          {/* 1. Services Column */}
          <div>
            <h3 className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.15em] text-white mb-1.5 sm:mb-2">
              Services
            </h3>
            <ul className="space-y-0.5 text-[11px] sm:text-xs">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-[#BFC7D5] hover:text-[#00D9FF] hover:translate-x-1 duration-200 transition-all inline-flex items-center w-full min-w-[44px] min-h-[40px] py-0.5 leading-tight"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Aviation Column */}
          <div>
            <h3 className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.15em] text-white mb-1.5 sm:mb-2">
              Aviation
            </h3>
            <ul className="space-y-0.5 text-[11px] sm:text-xs">
              {aviationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-[#BFC7D5] hover:text-[#00D9FF] hover:translate-x-1 duration-200 transition-all inline-flex items-center w-full min-w-[44px] min-h-[40px] py-0.5 leading-tight"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Company Column */}
          <div>
            <h3 className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.15em] text-white mb-1.5 sm:mb-2">
              Company
            </h3>
            <ul className="space-y-0.5 text-[11px] sm:text-xs">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-[#BFC7D5] hover:text-[#00D9FF] hover:translate-x-1 duration-200 transition-all inline-flex items-center w-full min-w-[44px] min-h-[40px] py-0.5 leading-tight"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Resources Column */}
          <div>
            <h3 className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.15em] text-white mb-1.5 sm:mb-2">
              Resources
            </h3>
            <ul className="space-y-0.5 text-[11px] sm:text-xs">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-[#BFC7D5] hover:text-[#00D9FF] hover:translate-x-1 duration-200 transition-all inline-flex items-center w-full min-w-[44px] min-h-[40px] py-0.5 leading-tight"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Desktop-only Contact & Social Column */}
          <div className="hidden md:block space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-white mb-2">
              Connect
            </h3>
            <div className="space-y-1 text-xs text-[#BFC7D5]">
              <div>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-white hover:text-[#00D9FF] transition-colors inline-flex items-center min-h-[40px]"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div className="flex flex-col gap-0.5">
                {siteContent.contact.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="text-white hover:text-[#00D9FF] transition-colors inline-flex items-center min-h-[40px]"
                  >
                    {phone}
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-[#BFC7D5] pt-0.5">
                {siteContent.contact.address}
              </p>
            </div>
            {/* Desktop Social Links */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {SOCIALS.map((url) => {
                const social = getSocialMeta(url);
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="shrink-0 w-10 h-10 min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-[#BFC7D5] hover:border-[#00D9FF]/60 hover:text-[#00D9FF] transition-colors"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill={social.isFilled ? "currentColor" : "none"}
                      stroke={social.isFilled ? "none" : "currentColor"}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {social.path}
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar with copyright and regulators list */}
        <div className="pt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/50">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
            <p>&copy; {year} ZYXEN. All rights reserved.</p>
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-white/60">
              <span>Standards:</span>
              {siteContent.regulators.list.map((reg) => (
                <span
                  key={reg.name}
                  className="rounded border border-white/10 bg-white/[0.02] px-1.5 py-0.5 text-[9px]"
                >
                  {reg.name}
                </span>
              ))}
            </div>
          </div>
          <BackToTopButton />
        </div>
      </div>
    </footer>
    {/* Mobile bottom bar clearance spacer so fixed bottom navigation never occludes footer content */}
    <div
      className="h-[calc(4rem+env(safe-area-inset-bottom,0px))] md:hidden pointer-events-none bg-[#030305]"
      aria-hidden="true"
    />
  </>
  );
}

export default SiteFooter;
