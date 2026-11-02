"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { AudioToggle } from "@/components/dom/AudioToggle";
import { BlogsOverlay } from "@/components/dom/blogs/BlogsOverlay";

const ProjectsScene = dynamic(() => import("@/components/canvas/projects/ProjectsScene"), { ssr: false });

export default function Blogs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden cursor-none">
      <CustomCursor />
      <AudioToggle />
      <Header />
      
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
          <ProjectsScene 
            triggerId="#overlay-container-blogs" 
            scrollerId="#scroll-container-blogs" 
          />
        </Suspense>
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden" id="scroll-container-blogs">
        <BlogsOverlay />
      </div>
    </main>
  );
}
