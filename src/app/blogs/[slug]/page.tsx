import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";
import { getAllPosts, getPostBySlug, renderContent, safeImageSrc, extractH2Headings } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

function formatBlogTitle(rawTitle: string): string {
  let title = rawTitle.trim();
  const maxLen = title.includes("&") ? 52 : 57;
  if (title.length + 8 <= 60 && !title.includes("&")) {
    return `${title} | ZYXEN`;
  }
  if (title.length > maxLen) {
    title = `${title.slice(0, maxLen).replace(/\s+\S*$/, "")}...`;
  }
  return title;
}

function formatBlogDescription(rawDesc: string): string {
  let desc = (rawDesc || "").replace(/\s+/g, " ").trim();
  if (desc.length > 140) {
    desc = `${desc.slice(0, 137).replace(/\s+\S*$/, "")}...`;
  }
  if (desc.length < 70) {
    desc = `${desc} Read technical insights and architectural analysis from ZYXEN.`;
    if (desc.length > 140) {
      desc = `${desc.slice(0, 137).replace(/\s+\S*$/, "")}...`;
    }
  }
  return desc;
}

interface CategoryCTA {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaText: string;
}

const CATEGORY_CTA_MAP: Record<string, CategoryCTA> = {
  "Website Design": {
    eyebrow: "Website Design & Engineering",
    title: "Need a high-converting, performance-first website?",
    description: "ZYXEN crafts bespoke, fast web applications and business websites built to turn visitors into long-term clients.",
    href: "/services",
    ctaText: "Explore Web Design Services",
  },
  "Production Management": {
    eyebrow: "Production & Batch Tracking Software",
    title: "Digitize batch records, lot traceability & quality tracking", // VERIFY: claim
    description: "ZYXEN builds custom production management and inventory systems purpose-built for pharma manufacturers in Hyderabad.",
    href: "/technology",
    ctaText: "Discover Production Software",
  },
  "Aviation Academy": {
    eyebrow: "Aviation Academy Systems",
    title: "DGCA, FAA & EASA pilot mock exam portal and ERP",
    description: "Empower your aviation ground school with modular mock exam simulators, fee ledgers, and student management pipelines.",
    href: "/aviation-academy-software",
    ctaText: "Explore Aviation Software",
  },
  "Exam Portals": {
    eyebrow: "Online Assessment Engines",
    title: "Custom mock test and exam portals built for scale",
    description: "Purpose-built online examination portals supporting negative marking, timed assessments, and multi-authority syllabus patterns.",
    href: "/aviation-academy-software",
    ctaText: "View Exam Solutions",
  },
  "AI Engineering": {
    eyebrow: "AI & Automation Engineering",
    title: "Integrate predictive intelligence into your workflow",
    description: "From custom LLM workflows to automated business logic, ZYXEN builds robust AI systems tailored to your operating model.",
    href: "/services",
    ctaText: "Explore AI Solutions",
  },
  "High-Performance Web": {
    eyebrow: "Core Web Vitals & Speed",
    title: "Fast load times and targeted Core Web Vitals",
    description: "We re-architect slow websites into modern edge-rendered platforms with optimized TTFB, AVIF/WebP assets, and minimized layout shifts.",
    href: "/technology",
    ctaText: "View Architecture & Tech",
  },
  "Modern Cloud Architecture": {
    eyebrow: "Cloud & Infrastructure",
    title: "Scalable, resilient cloud systems built for growth",
    description: "Design and implement modern serverless and containerized cloud architectures configured to handle traffic spikes.",
    href: "/technology",
    ctaText: "Explore Cloud Architecture",
  },
  "System Design": {
    eyebrow: "Enterprise Software Architecture",
    title: "Mission-critical system design for complex operations",
    description: "We architect scalable databases, fault-tolerant APIs, and decoupled micro-services for demanding business workflows.",
    href: "/technology",
    ctaText: "Learn About Our System Design",
  },
};

const DEFAULT_CTA: CategoryCTA = {
  eyebrow: "Custom Digital Solutions",
  title: "Ready to scale your digital infrastructure?",
  description: "ZYXEN designs and develops custom web platforms, software solutions, and automated business tools.",
  href: "/contact",
  ctaText: "Talk to ZYXEN Engineering",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const image = post.image.startsWith("http")
    ? post.image
    : `${SITE_URL}${safeImageSrc(post.image)}`;

  const safeTitle = formatBlogTitle(post.title);
  const safeDesc = formatBlogDescription(post.excerpt);

  return pageMetadata({
    title: safeTitle,
    description: safeDesc,
    path: `/blogs/${post.slug}`,
    image,
    type: "article",
    publishedTime: post.date,
    absoluteTitle: true,
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = renderContent(post.content);
  const h2Headings = extractH2Headings(html);

  // Guarantee 3 related articles (prefer matching category, fill from other posts)
  const allPosts = getAllPosts();
  const sameCategory = allPosts.filter((p) => p.category === post.category && p.slug !== post.slug);
  const otherPosts = allPosts.filter((p) => p.category !== post.category && p.slug !== post.slug);
  const related = [...sameCategory, ...otherPosts].slice(0, 3);

  const url = `${SITE_URL}/blogs/${post.slug}`;
  const image = post.image.startsWith("http")
    ? post.image
    : `${SITE_URL}${safeImageSrc(post.image)}`;

  // Calculate clean word count
  const wordCount = post.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ").length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: formatBlogDescription(post.excerpt),
    image,
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    author: {
      "@type": "Person",
      name: post.author || "ZYXEN Team",
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    articleSection: post.category,
    inLanguage: "en-IN",
    wordCount,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const contextualCta = CATEGORY_CTA_MAP[post.category] || DEFAULT_CTA;

  return (
    <main className="relative min-h-[100svh] w-full bg-[#050505] text-white cursor-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(110,91,255,0.18), transparent 70%)",
        }}
      />
      <CustomCursor />
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="relative z-10 mx-auto w-full max-w-3xl px-5 pt-28 md:pt-36 pb-16 md:pb-24">
        <Breadcrumbs
          items={[{ label: "Blogs", href: "/blogs" }, { label: post.title }]}
          className="mb-6"
        />

        <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
          <span className="font-bold text-[#00D9FF]">{post.category}</span>
          <span className="text-white/40 normal-case tracking-normal">{post.readTime}</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          {post.title}
        </h1>

        <p className="mt-4 text-sm text-white/50">
          {post.author} · <time dateTime={post.date}>{post.date}</time>
          {post.updatedDate && (
            <span className="ml-2 text-white/40">
              (Updated: <time dateTime={post.updatedDate}>{post.updatedDate}</time>)
            </span>
          )}
        </p>

        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={safeImageSrc(post.image)}
            alt={post.coverImageAlt || post.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            unoptimized={post.image.startsWith("http")}
          />
        </div>

        {h2Headings.length >= 4 && (
          <nav
            aria-label="Table of contents"
            className="my-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6"
          >
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF] mb-3">
              Table of Contents
            </p>
            <ol className="space-y-2 list-decimal list-inside text-sm text-[#BFC7D5]">
              {h2Headings.map((h) => (
                <li key={h.id} className="leading-snug">
                  <a
                    href={`#${h.id}`}
                    className="hover:text-[#00D9FF] hover:underline transition-colors ml-1 inline"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="zy-prose mt-10" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Author Box */}
        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#00D9FF] to-[#6E5BFF] flex items-center justify-center text-black font-extrabold text-xl shrink-0">
              {post.author ? post.author.slice(0, 2).toUpperCase() : "ZY"}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white">
                  {post.author || "ZYXEN Engineering Team"}
                </h3>
                <span className="text-[10px] font-mono text-[#00D9FF] border border-[#00D9FF]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Author
                </span>
              </div>
              <p className="text-sm text-[#BFC7D5] leading-relaxed">
                Engineering software architectures, high-performance web applications, and operational platforms for aviation academies and enterprise businesses at ZYXEN.
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs font-mono">
                <Link href="/about" className="text-[#00D9FF] hover:underline">
                  About ZYXEN &rarr;
                </Link>
                <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
                  Contact Team
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contextual Service Call-to-Action */}
        <div className="mt-14 rounded-2xl border border-[#00D9FF]/30 bg-gradient-to-br from-[#00D9FF]/[0.07] via-white/[0.02] to-transparent p-6 sm:p-8">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#00D9FF] mb-2">
            {contextualCta.eyebrow}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {contextualCta.title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#BFC7D5] leading-relaxed">
            {contextualCta.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={contextualCta.href}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#00D9FF] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-white hover:scale-105 transition-all"
            >
              {contextualCta.ctaText} &rarr;
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-white/10 pt-10">
            <h2 className="text-xl font-bold text-white">Related articles</h2>
            <ul className="mt-4 grid gap-3">
              {related.map((r) => (
                <li key={r.slug} className="group">
                  <Link
                    href={`/blogs/${r.slug}`}
                    className="text-[#BFC7D5] group-hover:text-[#00D9FF] transition-colors flex items-center justify-between text-sm sm:text-base"
                  >
                    <span>{r.title}</span>
                    <span className="text-xs font-mono text-white/40 ml-4 shrink-0">
                      {r.category} &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      <SiteFooter />
    </main>
  );
}
