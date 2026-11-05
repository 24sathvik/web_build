"use client";

import { useFrame } from "@react-three/fiber";
import { Sphere, Torus, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useRef } from "react";
import SceneShell, { useQualityTierContext } from "../SceneShell";
import { isReducedMotion } from "@/lib/motion";

function BlackHole() {
  const groupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const tier = useQualityTierContext();
  const isLite = tier === "lite";

  useFrame((state) => {
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
      <Sphere args={[2, isLite ? 32 : 64, isLite ? 32 : 64]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>
      
      {/* Accretion Disk */}
      <Torus ref={diskRef} args={[3, 0.5, 16, isLite ? 40 : 100]}>
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.6} wireframe />
      </Torus>
      
      {/* Outer Glow */}
      <Torus args={[3.2, 1, 16, isLite ? 40 : 100]}>
        <meshBasicMaterial color="#6E5BFF" transparent opacity={0.1} />
      </Torus>
    </group>
  );
}

function ContactEffects() {
  const tier = useQualityTierContext();
  const isLite = tier === "lite";

  if (isLite) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={2} mipmapBlur />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={3} mipmapBlur />
      <Vignette eskil={false} offset={0.1} darkness={1.5} />
    </EffectComposer>
  );
}

function ContactContent() {
  const tier = useQualityTierContext();
  const isLite = tier === "lite";
  const starCount = isLite ? 1250 : 5000;

  return (
    <>
      <color attach="background" args={["#050505"]} />
      
      <Stars key={starCount} radius={100} depth={50} count={starCount} factor={4} saturation={0} fade speed={isLite ? 0.5 : 1} />

      <BlackHole />

      <ContactEffects />
    </>
  );
}

export default function ContactScene() {
  return (
    <SceneShell
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <ContactContent />
    </SceneShell>
  );
}
