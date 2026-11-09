"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SceneShell, { useQualityTierContext } from "../SceneShell";
import { createSeededRandom } from "@/lib/seededRandom";
import { isReducedMotion } from "@/lib/motion";

function Helix() {
  const pointsRef = useRef<THREE.Points>(null);
  const tier = useQualityTierContext();
  const isLite = tier === "lite";
  
  // Cut particle count to 25% on lite (500 vs 2000)
  const particleCount = isLite ? 500 : 2000;
  
  const positions = useMemo(() => {
    const rng = createSeededRandom(42);
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const angle = t * Math.PI * 40; // 20 full turns
      const radius = 2;
      const y = (t - 0.5) * 100; // Tunnel length 100
      
      // Two strands
      if (i % 2 === 0) {
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
      } else {
        pos[i * 3] = Math.cos(angle + Math.PI) * radius;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(angle + Math.PI) * radius;
      }
      
      // Add slight deterministic randomness
      pos[i * 3] += (rng() - 0.5) * 0.5;
      pos[i * 3 + 1] += (rng() - 0.5) * 0.5;
      pos[i * 3 + 2] += (rng() - 0.5) * 0.5;
    }
    return pos;
  }, [particleCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Points key={particleCount} ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#00D9FF" size={isLite ? 0.15 : 0.1} sizeAttenuation={true} depthWrite={false} />
    </Points>
  );
}

function CameraRig() {
  const { camera } = useThree();

  useGSAP(() => {
    // Start camera at the top of the tunnel
    camera.position.set(0, 40, 0);
    camera.rotation.set(-Math.PI / 2, 0, 0);

    if (isReducedMotion()) {
      return;
    }

    // Animate camera flying through the tunnel on scroll
    gsap.to(camera.position, {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: "#overlay-container-about",
        scroller: "#scroll-container-about",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
  });

  return null;
}

function AboutEffects() {
  const tier = useQualityTierContext();
  if (tier !== "full") return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2} mipmapBlur />
      <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}

export default function AboutScene() {
  return (
    <SceneShell
      camera={{ position: [0, 40, 0], fov: 60, near: 0.1, far: 200 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 5, 40]} />

      <CameraRig />
      <Helix />

      <AboutEffects />
    </SceneShell>
  );
}
