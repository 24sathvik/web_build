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

const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "All Services", href: "/services" },
      { label: "Custom Web Platforms", href: "/services" },
      { label: "Raise Lab Equipment", href: "/projects#raise-lab-equipment" },
      { label: "ZyOps & GoalFlow", href: "/projects#zyops" },
    ],
  },
  {
    title: "Aviation Solutions",
    links: [
      { label: "Aviation Academy Software", href: "/aviation-academy-software" },
      { label: "Pilot Exam Portal Modules", href: "/aviation-academy-software#modules" },
      { label: "Aviation Systems", href: "/projects#aviation-systems" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Technology", href: "/technology" },
      { label: "Projects", href: "/projects" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blogs", href: "/blogs" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Site footer"
      className="relative z-20 pointer-events-auto border-t border-[#00D9FF]/20 bg-gradient-to-b from-[#07080f] via-[#050508] to-[#030305] text-white [content-visibility:auto] [contain-intrinsic-size:auto_1400px] lg:[contain-intrinsic-size:auto_560px]"
    >
      {/* Subtle glowing top divider hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00D9FF]/80 to-transparent shadow-[0_0_16px_rgba(0,217,255,0.45)]"
      />

      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-14 md:pt-20 pb-28 md:pb-12">
        {/* Start a project CTA band */}
        <div className="mb-14 rounded-2xl border border-white/10 bg-gradient-to-r from-[#00D9FF]/[0.08] via-[#6E5BFF]/[0.06] to-white/[0.02] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF] mb-2">
              Start a project
            </p>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Ready to build your website, platform, or aviation system?
            </p>
            <p className="mt-2 text-sm text-[#BFC7D5]">
              Speak directly with the ZYXEN engineering team in Hyderabad.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-[#00D9FF] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-white transition-colors"
            >
              Start a project
            </Link>
            <Link
              href="/projects"
              className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
            >
              View work
            </Link>
          </div>
        </div>

        {/* Brand + columns + contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          {/* Brand + Direct Contact */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <Link
                href="/"
                className="inline-block text-4xl sm:text-5xl font-bold tracking-tighter text-white hover:text-[#00D9FF] transition-colors"
              >
                ZYXEN
              </Link>
              <p className="mt-2 text-xs font-mono uppercase tracking-[0.25em] text-[#BFC7D5]">
                {siteContent.contact.brandLine}
              </p>
            </div>

            <div className="space-y-3 text-sm text-[#BFC7D5]">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#00D9FF]/90">
                  Email
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-white hover:text-[#00D9FF] transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>

              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#00D9FF]/90">
                  Phone
                </p>
                <div className="flex flex-col gap-1 mt-0.5">
                  {siteContent.contact.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="text-white hover:text-[#00D9FF] transition-colors w-fit"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#00D9FF]/90">
                  Location
                </p>
                <p>{siteContent.contact.address}</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIALS.map((url) => {
                const social = getSocialMeta(url);
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-[#BFC7D5] hover:border-[#00D9FF]/60 hover:text-[#00D9FF] transition-colors"
                  >
                    <svg
                      width="18"
                      height="18"
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

          {/* 4 Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white mb-4">
                  {col.title}
                </h2>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[#BFC7D5] hover:text-[#00D9FF] transition-colors inline-block py-0.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Regulators note & bottom copyright */}
        <div className="pt-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-white/60">
            <p className="leading-relaxed max-w-3xl">
              {siteContent.regulators.note}
            </p>
            <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] uppercase tracking-wider text-white/70">
              {siteContent.regulators.list.map((reg) => (
                <span
                  key={reg.name}
                  className="rounded border border-white/15 bg-white/[0.03] px-2.5 py-1"
                >
                  {reg.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10 pt-6">
            <p className="text-xs text-white/60">
              &copy; {year} ZYXEN. All rights reserved.
            </p>
            <BackToTopButton />
          </div>
        </div>
      </div>
    </footer>
  );
}

