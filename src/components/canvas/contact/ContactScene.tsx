"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Torus, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useRef } from "react";
import gsap from "gsap";

function BlackHole() {
  const groupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (diskRef.current) {
      diskRef.current.rotation.z = state.clock.getElapsedTime() * 2;
    }
    
    if (groupRef.current) {
      // Gentle floating and mouse following
      const x = (state.pointer.x * 2 - groupRef.current.position.x) * 0.05;
      const y = (state.pointer.y * 2 - groupRef.current.position.y) * 0.05;
      
      groupRef.current.position.x += x;
      groupRef.current.position.y += y;
      
      // Tilt towards mouse
      groupRef.current.rotation.x = state.pointer.y * 0.5;
      groupRef.current.rotation.y = state.pointer.x * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]} rotation={[Math.PI / 3, 0, 0]}>
      {/* The Void */}
      <Sphere args={[2, 64, 64]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>
      
      {/* Accretion Disk */}
      <Torus ref={diskRef} args={[3, 0.5, 16, 100]}>
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.6} wireframe />
      </Torus>
      
      {/* Outer Glow */}
      <Torus args={[3.2, 1, 16, 100]}>
        <meshBasicMaterial color="#6E5BFF" transparent opacity={0.1} />
      </Torus>
    </group>
  );
}

export default function ContactScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <color attach="background" args={["#050505"]} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <BlackHole />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={3} mipmapBlur />
        <Vignette eskil={false} offset={0.1} darkness={1.5} />
      </EffectComposer>
    </Canvas>
  );
}
