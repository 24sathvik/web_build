"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, type ReactNode } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { BlogsOverlay, type BlogCard } from "@/components/dom/blogs/BlogsOverlay";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useLazySceneTrigger } from "@/hooks/useLazySceneTrigger";
import { useSelectionStore, blogStore } from "@/lib/sceneSync";
import Link from "next/link";

const BlogsScene = dynamic(() => import("@/components/canvas/blogs/BlogsScene"), { ssr: false });

export default function Blogs({ posts, footer }: { posts: BlogCard[]; footer?: ReactNode }) {
  const tier = useQualityTier();
  const { shouldMount, triggerTime } = useLazySceneTrigger(tier, "/blogs");
  const { hoveredSlug } = useSelectionStore(blogStore);
  const hoveredPost = hoveredSlug ? posts.find((p) => p.slug === hoveredSlug) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden cursor-none">
      <CustomCursor />
      <Header />

      <div className="absolute inset-0 z-0" aria-hidden="true">
        {shouldMount ? (
          <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
            <BlogsScene posts={posts} triggerTime={triggerTime} />
          </Suspense>
        ) : (
          <div
            className="w-full h-full bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(110,91,255,0.18),rgba(5,5,5,1))]"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Floating DOM title chip when hovering an orb in Signal Stream */}
      {hoveredPost && tier !== "static" && (
        <div
          id="blog-orb-chip"
          role="status"
          aria-live="polite"
          className="fixed left-0 top-0 z-30 w-64 max-w-[85vw] rounded-xl border border-[#6E5BFF]/60 bg-[#05060d]/92 px-3.5 py-2.5 shadow-[0_0_24px_rgba(110,91,255,0.28)] pointer-events-auto"
          style={{ transform: "translate3d(50vw, 40vh, 0) translate(-50%, -100%)" }}
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00D9FF]">
            {hoveredPost.category}
          </p>
          <p className="mt-1 text-xs font-bold text-white line-clamp-2 leading-snug">
            {hoveredPost.title}
          </p>
          <Link
            href={`/blogs/${hoveredPost.slug}`}
            className="mt-1.5 inline-flex min-h-[44px] items-center text-[11px] font-mono text-[#00D9FF] hover:underline"
          >
            Read article &rarr;
          </Link>
        </div>
      )}

      <div
        className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden touch-pan-y"
        id="scroll-container-blogs"
      >
        <BlogsOverlay posts={posts} />
        {footer}
      </div>
    </main>
  );
}
