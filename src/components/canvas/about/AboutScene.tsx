"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function Helix() {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate DNA-like double helix points
  const particleCount = 2000;
  const positions = useMemo(() => {
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
      
      // Add slight randomness
      pos[i * 3] += (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] += (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] += (Math.random() - 0.5) * 0.5;
    }
    return pos;
  }, [particleCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#00D9FF" size={0.1} sizeAttenuation={true} depthWrite={false} />
    </Points>
  );
}

import { useThree } from "@react-three/fiber";

function CameraRig() {
  const { camera } = useThree();

  useGSAP(() => {
    // Start camera at the top of the tunnel
    camera.position.set(0, 40, 0);
    camera.rotation.set(-Math.PI / 2, 0, 0);

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

export default function AboutScene() {
  return (
    <Canvas
      camera={{ position: [0, 40, 0], fov: 60, near: 0.1, far: 200 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 5, 40]} />

      <CameraRig />
      <Helix />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2} mipmapBlur />
        <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </Canvas>
  );
}
