"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { Header } from "@/components/dom/Header";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { AudioToggle } from "@/components/dom/AudioToggle";
import { ContactOverlay } from "@/components/dom/contact/ContactOverlay";

const ContactScene = dynamic(() => import("@/components/canvas/contact/ContactScene"), { ssr: false });

export default function Contact() {
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
          <ContactScene />
        </Suspense>
      </div>

      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden" id="scroll-container-contact">
        <ContactOverlay />
      </div>
    </main>
  );
}
