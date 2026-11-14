import Link from "next/link";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";
import { SITE_URL } from "@/lib/site";
import type { SolutionPageConfig } from "@/content/solutions";
import { getAllPosts } from "@/lib/blog";

interface SolutionPageLayoutProps {
  solution: SolutionPageConfig;
}

export function SolutionPageLayout({ solution }: SolutionPageLayoutProps) {
  const url = `${SITE_URL}${solution.path}`;

  // Related blog articles resolution
  const allPosts = getAllPosts();
  const relatedPosts = solution.relatedBlogSlugs
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Service Schema
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: solution.title,
    serviceType: solution.badge,
    description: solution.metaDescription,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    url,
  };

  // FAQPage Schema
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: solution.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Optional SoftwareApplication schema (for pharma solution)
  const softwareAppJsonLd =
    solution.slug === "production-management-software-pharma"
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "@id": `${url}#software`,
          name: "ZYXEN Production Management & Batch Tracking System",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web Browser",
          description:
            "Cloud-based manufacturing batch tracking, raw material lot traceability, and digital batch record system for API and pharmaceutical manufacturers.",
          url,
        }
      : null;

  return (
    <main className="relative min-h-[100svh] w-full bg-[#050505] text-white cursor-none">
      {/* Decorative gradient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[65vh]"
        style={{
          background:
            "radial-gradient(65% 65% at 50% 0%, rgba(0,217,255,0.14), transparent 75%)",
        }}
      />
      <CustomCursor />
      <Header />

      {/* Structured Data Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {softwareAppJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        />
      )}

      <article className="relative z-10 mx-auto w-full max-w-5xl px-5 pt-28 md:pt-36 pb-16 md:pb-24">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Solutions", href: "/services" },
            { label: solution.title },
          ]}
          className="mb-8"
        />

        {/* Hero Section */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00D9FF]/30 bg-[#00D9FF]/[0.08] px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-[#00D9FF] uppercase">
            <span>&bull;</span> {solution.badge}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.12]">
            {solution.heroHeadline}
          </h1>

          <p className="max-w-3xl text-base sm:text-lg md:text-xl text-[#BFC7D5] leading-relaxed font-light">
            {solution.heroSub}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              data-cta="solution_primary_cta"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#00D9FF] px-7 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-white hover:scale-105 transition-all"
            >
              Consult with Engineering &rarr;
            </Link>
            <Link
              href="/aviation-academy-software"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
            >
              Explore Aviation Platform
            </Link>
          </div>
        </header>

        {/* In-Depth Overview Section */}
        <section className="mt-16 space-y-6 text-[#BFC7D5] leading-relaxed text-base sm:text-lg border-t border-white/10 pt-12">
          <h2 className="text-xl font-bold font-mono tracking-tight text-white uppercase text-xs text-[#00D9FF]">
            Executive Overview
          </h2>
          {solution.overview.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </section>

        {/* Operational Problems Section */}
        <section className="mt-16 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.04] via-white/[0.01] to-transparent p-6 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-red-400">
              The Operational Challenge
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {solution.problemSummary}
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {solution.problems.map((prob, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-2.5"
              >
                <div className="flex items-center gap-2.5 text-red-400">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Problem {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {prob.title}
                </h3>
                <p className="text-sm text-[#BFC7D5] leading-relaxed">
                  {prob.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How ZYXEN Solves It Section */}
        <section className="mt-16 space-y-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF]">
              Engineered Architecture
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {solution.solutionSummary}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solution.solutions.map((sol, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#00D9FF]/20 bg-gradient-to-br from-[#00D9FF]/[0.05] via-white/[0.02] to-transparent p-6 space-y-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#00D9FF]/20 text-[#00D9FF] flex items-center justify-center font-mono text-xs font-bold">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {sol.title}
                </h3>
                <p className="text-sm text-[#BFC7D5] leading-relaxed">
                  {sol.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What Is Included Section */}
        <section className="mt-16 border-t border-white/10 pt-14">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF]">
            Platform Deliverables
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            What Is Included in the System
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {solution.inclusions.map((inc, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-2 hover:border-white/20 transition-colors"
              >
                <div className="text-xs font-mono text-white/40 tracking-wider">
                  Module 0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-white">
                  {inc.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#BFC7D5] leading-relaxed">
                  {inc.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Implementation Process Roadmap */}
        <section className="mt-16 border-t border-white/10 pt-14">
          <div className="max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF]">
              Delivery Methodology
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {solution.processSummary}
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {solution.process.map((step) => (
              <div
                key={step.step}
                className="flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors"
              >
                <div className="font-mono text-2xl font-extrabold text-[#00D9FF] shrink-0 w-12">
                  {step.step}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#BFC7D5] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5-Question Visible FAQ Section */}
        <section className="mt-16 border-t border-white/10 pt-14">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF]">
            Frequently Asked Questions
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Common Questions From Institutional Buyers
          </h2>

          <div className="mt-8 space-y-4">
            {solution.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-2.5"
              >
                <h3 className="text-base sm:text-lg font-bold text-white flex items-start gap-3">
                  <span className="font-mono text-xs text-[#00D9FF] border border-[#00D9FF]/40 rounded px-1.5 py-0.5 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-sm sm:text-base text-[#BFC7D5] leading-relaxed pl-8">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Navigation Links (5+ Internal Links) */}
        <section className="mt-16 border-t border-white/10 pt-10">
          <h2 className="text-lg font-bold text-white">
            Explore Related Solutions &amp; Platform Capabilities
          </h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {solution.internalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-xs font-medium text-[#BFC7D5] hover:border-[#00D9FF]/50 hover:text-white transition-colors"
              >
                <span>{link.label}</span>
                <span className="text-[#00D9FF]">&rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Technical Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-14 border-t border-white/10 pt-10">
            <h2 className="text-lg font-bold text-white">
              Related Technical Engineering Articles
            </h2>
            <ul className="mt-4 grid gap-3">
              {relatedPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between min-h-[44px] gap-1 text-[#BFC7D5] hover:text-[#00D9FF] transition-colors p-3 rounded-lg border border-white/5 hover:border-white/15 bg-white/[0.01]"
                  >
                    <span className="text-sm font-medium">{post.title}</span>
                    <span className="text-xs font-mono text-white/40 shrink-0">
                      {post.category} &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Final Conversion Call-to-Action */}
        <div className="mt-16 rounded-2xl border border-[#00D9FF]/40 bg-gradient-to-br from-[#00D9FF]/[0.08] via-white/[0.02] to-[#6E5BFF]/[0.06] p-8 sm:p-10 text-center space-y-4">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF]">
            Deploy With Confidence
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            Ready to engineer your custom software platform?
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#BFC7D5] leading-relaxed">
            Schedule an initial technical consultation with our engineering team in Hyderabad. We review your operational bottlenecks, design system architectures, and deliver reliable custom software.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              data-cta="solution_footer_cta"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#00D9FF] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-white hover:scale-105 transition-all"
            >
              Start Your Project &rarr;
            </Link>
            <Link
              href="/projects"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
            >
              View Selected Work
            </Link>
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
