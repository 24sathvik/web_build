"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { blogStore, useSelectionStore } from "@/lib/sceneSync";
import { Breadcrumbs } from "@/components/dom/Breadcrumbs";

export interface BlogCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  image: string;
  date: string;
}

export function BlogsOverlay({ posts }: { posts: BlogCard[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { hoveredSlug } = useSelectionStore(blogStore);

  return (
    <div id="overlay-container-blogs" ref={containerRef} className="w-full relative z-10 pointer-events-none pb-32">
      {/* Full-height Hero Section matching Aviation & Projects architecture */}
      <section className="w-full min-h-[100svh] flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="hero-entrance pointer-events-auto mb-6">
          <Breadcrumbs items={[{ label: "Blogs" }]} />
        </div>
        <p className="hero-entrance text-xs md:text-sm text-[#00D9FF] uppercase tracking-[0.3em] font-bold font-mono mb-4 pointer-events-auto">
          The Discourse &bull; Thought Leadership
        </p>
        <h1 className="hero-entrance-delay text-[clamp(2.5rem,6vw,5.5rem)] font-bold tracking-tighter text-[#FFFFFF] mb-6 pointer-events-auto leading-tight max-w-4xl">
          LATEST IN <span className="text-[#6E5BFF]">INTELLIGENCE</span>
        </h1>
        <p className="hero-entrance-delay-2 text-base md:text-xl text-[#BFC7D5] max-w-2xl font-light pointer-events-auto leading-relaxed mb-8">
          Exploring the intersection of neural intelligence, software engineering, and high-performance digital architecture.
        </p>
        <div className="hero-entrance-delay-2 flex flex-wrap gap-4 justify-center pointer-events-auto">
          <a
            href="#articles-feed"
            className="min-h-[44px] inline-flex items-center px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono uppercase tracking-wider text-white transition-colors"
          >
            Explore Articles ({posts.length}) &darr;
          </a>
        </div>
      </section>

      {/* Articles Feed */}
      <div id="articles-feed" className="w-full px-4 sm:px-8 md:px-24 flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col gap-8 md:gap-12">
          {posts.map((post, idx) => {
            const isHighlighted = hoveredSlug === post.slug;
            return (
              <section key={post.id} className="blog-section w-full pointer-events-auto">
                <Link
                  href={`/blogs/${post.slug}`}
                  className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
                  aria-label={post.title}
                  onMouseEnter={() =>
                    blogStore.set({
                      domHoveredSlug: post.slug,
                      domHoveredCategory: post.category,
                    })
                  }
                  onMouseLeave={() =>
                    blogStore.set({ domHoveredSlug: null, domHoveredCategory: null })
                  }
                  onFocus={() =>
                    blogStore.set({
                      domHoveredSlug: post.slug,
                      domHoveredCategory: post.category,
                    })
                  }
                  onBlur={() =>
                    blogStore.set({ domHoveredSlug: null, domHoveredCategory: null })
                  }
                >
                  <div
                    className={`reveal-blog glass-panel p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 border transition-all duration-300 ${
                      isHighlighted
                        ? "border-[#00D9FF]/80 shadow-[0_0_28px_rgba(0,217,255,0.2)]"
                        : "border-white/10 hover:border-[#6E5BFF]/50"
                    }`}
                  >
                
                {post.image && (
                  <div className="w-full md:w-1/3 h-48 relative rounded-xl overflow-hidden shrink-0">
                    <Image 
                      src={post.image.startsWith("http") ? post.image : encodeURI(post.image)} 
                      alt={post.title} 
                      fill 
                      loading="lazy"
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover" 
                      unoptimized={post.image.startsWith("http")}
                    />
                  </div>
                )}
                
                <div className="flex flex-col flex-grow justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#00D9FF]">
                      {post.category}
                    </span>
                    <span className="text-xs text-white/40">{post.readTime}</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {post.title}
                  </h2>
                  
                  <p className="text-[#BFC7D5] text-base line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                  </div>
                </Link>
              </section>
            );
          })}
        </div>

      </div>
    </div>
  );
}
