"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useQualityTierContext } from "../SceneShell";

export default function Chapter1() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const tier = useQualityTierContext();
  const isLite = tier === "lite";

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.z = Math.sin(t * 0.5) * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.1;
      ringRef.current.rotation.y = t * 0.1;
    }
  });

  return (
    <group>
      <Float speed={isLite ? 1 : 2} rotationIntensity={0.5} floatIntensity={1}>
        {/* ZYXEN Symbol Proxy */}
        <mesh ref={coreRef} position={[0, 0, 0]}>
          <octahedronGeometry args={[1.5, 0]} />
          {isLite ? (
            <meshStandardMaterial
              color="#00D9FF"
              emissive="#00D9FF"
              emissiveIntensity={1.5}
              metalness={0.8}
              roughness={0.2}
              wireframe
            />
          ) : (
            <MeshDistortMaterial
              color="#00D9FF"
              emissive="#00D9FF"
              emissiveIntensity={2}
              distort={0.2}
              speed={2}
              metalness={0.9}
              roughness={0.1}
              wireframe
            />
          )}
        </mesh>
        
        {/* Outer Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[2.5, 0.05, 16, isLite ? 40 : 100]} />
          <meshStandardMaterial
            color="#6E5BFF"
            emissive="#6E5BFF"
            emissiveIntensity={1.5}
            metalness={1}
            roughness={0}
          />
        </mesh>
      </Float>

      {/* Particle System: 25% count on lite */}
      <Sparkles
        count={isLite ? 125 : 500}
        scale={10}
        size={isLite ? 1.5 : 2}
        speed={0.4}
        opacity={0.5}
        color="#BFC7D5"
      />
    </group>
  );
}
