"use client";

import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CameraRig() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useGSAP(() => {
    // Explicitly set camera to Chapter 1 position
    camera.position.set(0, 0, 5);

    // The master timeline synced with the main scroll container
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#overlay-container",
        scroller: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
        invalidateOnRefresh: true,
      },
    });

    // Animate camera moving down across the chapters (each chapter is 20 units apart)
    // Chapters:
    // Ch1: y=0
    // Ch2: y=-20
    // Ch3: y=-40
    // Ch4: y=-60
    // Ch5: y=-80
    
    // Move to Chapter 2
    tl.to(camera.position, {
      y: -20,
      ease: "power2.inOut",
    }, "chapter2");

    // Move to Chapter 3
    tl.to(camera.position, {
      y: -40,
      ease: "power2.inOut",
    }, "chapter3");

    // Move to Chapter 4
    tl.to(camera.position, {
      y: -60,
      ease: "power2.inOut",
    }, "chapter4");

    // Move to Chapter 5
    tl.to(camera.position, {
      y: -80,
      ease: "power2.inOut",
    }, "chapter5");

    // Defer ScrollTrigger.refresh to rAF so first frame paint is not blocked by synchronous DOM layout reflow
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      tl.kill();
    };
  }, [camera]);

  return <group ref={groupRef} />;
}
