"use client";

import { useFrame } from "@react-three/fiber";
import { TorusKnot, Float, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SceneShell, { useQualityTierContext } from "../SceneShell";
import { isReducedMotion } from "@/lib/motion";

function DataCore({ triggerId, scrollerId }: { triggerId: string; scrollerId: string }) {
  const coreRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const tier = useQualityTierContext();
  const isLite = tier === "lite";

  useGSAP(() => {
    if (!coreRef.current) return;
    if (typeof window !== "undefined" && !document.querySelector(triggerId)) return;
    if (isReducedMotion()) return;

    // As the user scrolls, the entire core rotates and scales
    gsap.to(coreRef.current.rotation, {
      y: Math.PI * 2,
      z: Math.PI,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: triggerId,
        scroller: scrollerId,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    gsap.to(coreRef.current.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: triggerId,
        scroller: scrollerId,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
  }, { dependencies: [triggerId, scrollerId] });

  useFrame((state) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      outerRingRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  // Premium liquid glass material for full; lightweight standard material for lite
  const glassMaterial = useMemo(() => {
    if (isLite) {
      return new THREE.MeshStandardMaterial({
        color: "#080808",
        metalness: 0.8,
        roughness: 0.2,
        emissive: "#00D9FF",
        emissiveIntensity: 0.2,
        wireframe: true,
      });
    }

    return new THREE.MeshPhysicalMaterial({
      color: "#050505",
      metalness: 0.9,
      roughness: 0.05,
      transmission: 1,
      thickness: 2,
      envMapIntensity: 2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: "#00D9FF",
      emissiveIntensity: 0.2,
      wireframe: true,
    });
  }, [isLite]);

  return (
    <group ref={coreRef} position={[0, 0, 0]}>
      <Float speed={isLite ? 1 : 2} floatIntensity={isLite ? 1 : 1.5} rotationIntensity={isLite ? 1 : 2}>
        {/* Central Torus Knot */}
        <TorusKnot args={isLite ? [3, 0.8, 128, 16] : [3, 0.8, 256, 32]} material={glassMaterial} />
        
        {/* Inner solid glowing core */}
        <TorusKnot args={isLite ? [2.5, 0.2, 64, 12] : [2.5, 0.2, 128, 16]}>
          <meshStandardMaterial color="#6E5BFF" emissive="#6E5BFF" emissiveIntensity={1.5} />
        </TorusKnot>

        {/* Outer rotating ring */}
        <mesh ref={outerRingRef}>
          <torusGeometry args={[5, 0.05, 16, isLite ? 40 : 100]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

function ProjectsEffects() {
  const tier = useQualityTierContext();
  if (tier !== "full") return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2.5} mipmapBlur />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.005, 0.005)}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}

function ProjectsContent({
  triggerId,
  scrollerId,
}: {
  triggerId: string;
  scrollerId: string;
}) {
  const tier = useQualityTierContext();
  const isLite = tier === "lite";
  const starCount = isLite ? 750 : 3000;

  return (
    <>
      <color attach="background" args={["#050505"]} />
      
      {/* Background Stars: cut to 25% on lite */}
      <Stars key={starCount} radius={100} depth={50} count={starCount} factor={4} saturation={1} fade speed={isLite ? 1 : 2} />
      
      {/* Lighting */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={3} color="#00D9FF" />
      <directionalLight position={[-10, -10, -10]} intensity={3} color="#6E5BFF" />
      <pointLight position={[0, 0, 5]} intensity={10} color="#FFFFFF" distance={20} />

      <DataCore triggerId={triggerId} scrollerId={scrollerId} />

      <ProjectsEffects />
    </>
  );
}

export default function ProjectsScene({ 
  triggerId = "#overlay-container-projects", 
  scrollerId = "#scroll-container-projects" 
}: { 
  triggerId?: string; 
  scrollerId?: string; 
}) {
  return (
    <SceneShell
      camera={{ position: [0, 0, 12], fov: 45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <ProjectsContent triggerId={triggerId} scrollerId={scrollerId} />
    </SceneShell>
  );
}
