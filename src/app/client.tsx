"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Overlay } from "@/components/dom/Overlay";
import { Header } from "@/components/dom/Header";
import { AudioToggle } from "@/components/dom/AudioToggle";
import { CustomCursor } from "@/components/dom/CustomCursor";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Dynamically import the Canvas to prevent SSR issues with Three.js
const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
});

export default function Home() {
  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden cursor-none">
      <CustomCursor />
      <AudioToggle />
      <Header />
      
      {/* 3D WebGL Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-[#050505]" />}>
          <Scene />
        </Suspense>
      </div>

      {/* DOM Overlay for Scroll and UI */}
      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden" id="scroll-container">
        <Overlay />
      </div>
    </main>
  );
}
