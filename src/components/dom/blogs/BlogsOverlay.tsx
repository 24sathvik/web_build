"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";

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

gsap.registerPlugin(ScrollTrigger);

export function BlogsOverlay({ posts }: { posts: BlogCard[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = gsap.utils.toArray(".blog-section") as HTMLElement[];
    sections.forEach((section) => {
      const elements = section.querySelectorAll(".reveal-blog");
      if (prefersReducedMotion) {
        gsap.set(elements, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        elements,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            scroller: "#scroll-container-blogs",
            start: "top 80%",
            end: "center center",
            scrub: false,
          },
        }
      );
    });
  }, []);

  return (
    <div id="overlay-container-blogs" ref={containerRef} className="w-full relative z-10 pointer-events-none pb-32">
      <div className="w-full min-h-[100svh] pt-28 px-4 sm:px-8 md:px-24 flex flex-col items-center">
        
        <h1 className="text-[clamp(2.25rem,6vw,5rem)] font-bold tracking-tighter text-[#FFFFFF] mb-12 pointer-events-auto text-center leading-tight">
          LATEST IN <span className="text-[#6E5BFF]">INTELLIGENCE</span>
        </h1>

        <div className="w-full max-w-4xl flex flex-col gap-8 md:gap-12">
          {posts.map((post) => (
            <section key={post.id} className="blog-section w-full pointer-events-auto">
              <Link href={`/blogs/${post.slug}`} className="block" aria-label={post.title}>
              <div className="reveal-blog glass-panel p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 border border-white/10 hover:border-[#6E5BFF]/50 transition-colors duration-300">
                
                {post.image && (
                  <div className="w-full md:w-1/3 h-48 relative rounded-xl overflow-hidden shrink-0">
                    <Image 
                      src={post.image.startsWith("http") ? post.image : encodeURI(post.image)} 
                      alt={post.title} 
                      fill 
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
          ))}
        </div>

      </div>
    </div>
  );
}
