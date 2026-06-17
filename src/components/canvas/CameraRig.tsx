"use client";

import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function CameraRig() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useGSAP(() => {
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

  });

  return <group ref={groupRef} />;
}
