"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Box, Sphere, Torus, Cone } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { debugStore } from "@/lib/debugState";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function FirstFrameNotifier() {
  useFrame(() => {
    if (typeof window !== "undefined") {
      debugStore.setTimeline("firstFrame", performance.now());
    }
  });
  return null;
}

function Carousel() {
  const groupRef = useRef<THREE.Group>(null);

  useGSAP(() => {
    if (!groupRef.current) return;
    
    // Rotate the entire carousel based on scroll
    const anim = gsap.to(groupRef.current.rotation, {
      y: Math.PI * 2, // Full rotation
      ease: "none",
      scrollTrigger: {
        trigger: "#overlay-container-services",
        scroller: "#scroll-container-services",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // Defer ScrollTrigger.refresh to rAF so first frame paint is not blocked by synchronous DOM layout reflow
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      anim.kill();
    };
  }, []);

  const material = new THREE.MeshPhysicalMaterial({
    color: "#050505",
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 1,
    envMapIntensity: 2,
    emissive: "#6E5BFF",
    emissiveIntensity: 0.2,
    wireframe: true,
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Service 1 */}
      <Float speed={2} floatIntensity={2} position={[0, 0, 5]}>
        <Box args={[1.5, 1.5, 1.5]} material={material} />
      </Float>
      {/* Service 2 */}
      <Float speed={1.5} floatIntensity={1.5} position={[5, 0, 0]}>
        <Sphere args={[1, 32, 32]} material={material} />
      </Float>
      {/* Service 3 */}
      <Float speed={2.5} floatIntensity={1} position={[0, 0, -5]}>
        <Torus args={[1, 0.4, 16, 100]} material={material} />
      </Float>
      {/* Service 4 */}
      <Float speed={1.8} floatIntensity={2} position={[-5, 0, 0]}>
        <Cone args={[1, 2, 32]} material={material} />
      </Float>
    </group>
  );
}

export default function ServicesScene({ triggerTime }: { triggerTime?: number | null } = {}) {
  return (
    <Canvas
      camera={{ position: [0, 2, 10], fov: 45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <FirstFrameNotifier />
      <color attach="background" args={["#050505"]} />
      
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} color="#00D9FF" intensity={2} />

      <Carousel />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.005, 0.005)}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
    </Canvas>
  );
}
