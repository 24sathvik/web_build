import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/dom/Header";
import { SiteFooter } from "@/components/dom/SiteFooter";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description:
    "The page you are looking for does not exist or has been moved. Explore ZYXEN's digital solutions, services, and engineering case studies.",
  robots: {
    index: false,
    follow: false,
  },
};

const navigationLinks = [
  {
    href: "/",
    title: "Home",
    description: "Return to the main homepage and explore our core capabilities.",
    tag: "HQ",
  },
  {
    href: "/services",
    title: "Services",
    description: "Web development, system engineering, automation, and UI/UX design.",
    tag: "Offerings",
  },
  {
    href: "/aviation-academy-software",
    title: "Aviation Solutions",
    description: "Training academy management, pilot portal, and batch tracking.",
    tag: "Enterprise",
  },
  {
    href: "/projects",
    title: "Projects",
    description: "Explore our production portfolio and client implementations.",
    tag: "Case Studies",
  },
  {
    href: "/blogs",
    title: "Blogs",
    description: "In-depth engineering articles, web architecture, and design guides.",
    tag: "Insights",
  },
  {
    href: "/contact",
    title: "Contact",
    description: "Discuss a new project, schedule a consultation, or request a quote.",
    tag: "Inquiries",
  },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-20 bg-[#050505] text-white selection:bg-[#00D9FF] selection:text-black overflow-hidden"
      >
        {/* Subtle radial background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,217,255,0.12),transparent_70%)]"
        />

        <div className="relative z-10 max-w-4xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            HTTP 404 &bull; Route Not Found
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white font-exo mb-4">
            LOST IN{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              SPACE
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-base sm:text-lg text-gray-300 leading-relaxed mb-10">
            The coordinates you requested do not point to an active page. The resource may have been relocated, updated, or decommissioned.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left max-w-3xl mx-auto mb-10">
            {navigationLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="group relative flex flex-col justify-between p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 min-h-[44px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-400/80">
                      {item.tag}
                    </span>
                    <span className="text-gray-500 group-hover:text-cyan-400 transition-colors">
                      &rarr;
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-exo">
                    {item.title}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 leading-normal">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.3)]"
            >
              Return to Homepage
            </Link>
            <Link
              href="/contact"
              prefetch={false}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 bg-white/5"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

