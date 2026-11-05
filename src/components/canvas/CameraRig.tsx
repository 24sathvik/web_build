"use client";

import { useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function CameraRig() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useGSAP(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // In reduced motion, avoid intense 3D camera travel
      camera.position.set(0, 0, 5);
      return;
    }

    // The master timeline synced with the main scroll container
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#overlay-container",
        scroller: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // Smooth scrubbing
      },
    });

    // Move to Chapter 2
    tl.to(
      camera.position,
      {
        y: -20,
        ease: "power2.inOut",
      },
      "chapter2"
    );

    // Move to Chapter 3
    tl.to(
      camera.position,
      {
        y: -40,
        ease: "power2.inOut",
      },
      "chapter3"
    );

    // Move to Chapter 4
    tl.to(
      camera.position,
      {
        y: -60,
        ease: "power2.inOut",
      },
      "chapter4"
    );

    // Move to Chapter 5
    tl.to(
      camera.position,
      {
        y: -80,
        ease: "power2.inOut",
      },
      "chapter5"
    );
  });

  return <group ref={groupRef} />;
}
