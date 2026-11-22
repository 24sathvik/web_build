"use client";

import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useRef } from "react";
import SceneShell, { useQualityTierContext, useHasFirstFrame } from "../SceneShell";
import { isReducedMotion } from "@/lib/motion";

function BlackHole() {
  const groupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const tier = useQualityTierContext();
  const hasFirstFrame = useHasFirstFrame();
  const isLite = tier === "lite";

  useFrame((state) => {
    if (!hasFirstFrame) return;
    if (diskRef.current) {
      diskRef.current.rotation.z = state.clock.getElapsedTime() * (isLite ? 1 : 2);
    }
    
    if (groupRef.current && !isReducedMotion()) {
      // Floating and pointer response on desktop/fine pointer
      const x = (state.pointer.x * 2 - groupRef.current.position.x) * 0.05;
      const y = (state.pointer.y * 2 - groupRef.current.position.y) * 0.05;
      
      groupRef.current.position.x += x;
      groupRef.current.position.y += y;
      
      groupRef.current.rotation.x = state.pointer.y * 0.5;
      groupRef.current.rotation.y = state.pointer.x * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]} rotation={[Math.PI / 3, 0, 0]}>
      {/* The Void */}
      <mesh>
        <sphereGeometry args={[2, isLite ? 16 : 32, isLite ? 16 : 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Accretion Disk */}
      <mesh ref={diskRef}>
        <torusGeometry args={[3, 0.5, isLite ? 8 : 16, isLite ? 24 : 64]} />
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.6} wireframe />
      </mesh>
      
      {/* Outer Glow: deferred to frame 2 */}
      {hasFirstFrame && (
        <mesh>
          <torusGeometry args={[3.2, 1, isLite ? 8 : 16, isLite ? 24 : 64]} />
          <meshBasicMaterial color="#6E5BFF" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
}

function ContactEffects() {
  const tier = useQualityTierContext();
  const hasFirstFrame = useHasFirstFrame();
  if (tier !== "full" || !hasFirstFrame) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={3} mipmapBlur />
      <Vignette eskil={false} offset={0.1} darkness={1.5} />
    </EffectComposer>
  );
}

function ContactContent() {
  const tier = useQualityTierContext();
  const hasFirstFrame = useHasFirstFrame();
  const isLite = tier === "lite";
  const starCount = isLite ? 600 : 2000;

  return (
    <>
      <color attach="background" args={["#050505"]} />
      
      {hasFirstFrame && (
        <Stars key={starCount} radius={100} depth={50} count={starCount} factor={4} saturation={0} fade speed={isLite ? 0.5 : 1} />
      )}

      <BlackHole />

      <ContactEffects />
    </>
  );
}

export default function ContactScene({ triggerTime }: { triggerTime?: number | null }) {
  return (
    <SceneShell
      triggerTime={triggerTime}
      camera={{ position: [0, 0, 10], fov: 45, near: 0.1, far: 100 }}
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: true,
      }}
    >
      <ContactContent />
    </SceneShell>
  );
}
