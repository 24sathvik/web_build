import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { SiteFooter } from "@/components/dom/SiteFooter";
import { getAllPosts, getPostBySlug, renderContent, safeImageSrc } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  const image = post.image.startsWith("http") ? post.image : `${SITE_URL}${safeImageSrc(post.image)}`;
  return pageMetadata({
    title: `${post.title} | Zyxen`,
    description: post.excerpt,
    path: `/blogs/${post.slug}`,
    image,
    type: "article",
    publishedTime: post.date,
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = renderContent(post.content);
  const related = getAllPosts()
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);
  const url = `${SITE_URL}/blogs/${post.slug}`;
  const image = post.image.startsWith("http") ? post.image : `${SITE_URL}${safeImageSrc(post.image)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author || "ZYXEN" },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <main className="relative min-h-[100svh] w-full bg-[#050505] text-white cursor-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(110,91,255,0.18), transparent 70%)" }}
      />
      <CustomCursor />
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="relative z-10 mx-auto w-full max-w-3xl px-5 pt-28 md:pt-36 pb-16 md:pb-24">
        <Link href="/blogs" className="text-sm text-[#00D9FF] hover:underline">
          ← All articles
        </Link>
        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
          <span className="font-bold text-[#00D9FF]">{post.category}</span>
          <span className="text-white/40 normal-case tracking-normal">{post.readTime}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-white/50">
          {post.author} · <time dateTime={post.date}>{post.date}</time>
        </p>

        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={safeImageSrc(post.image)}
            alt={post.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            unoptimized={post.image.startsWith("http")}
          />
        </div>

        <div className="zy-prose mt-10" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-lg font-semibold">Need help with your website or software?</p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-full bg-[#00D9FF] px-6 py-3 text-sm font-bold text-black"
          >
            Contact ZYXEN
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold">Related articles</h2>
            <ul className="mt-4 grid gap-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/blogs/${r.slug}`} className="text-[#BFC7D5] hover:text-white">
                    {r.title}
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
