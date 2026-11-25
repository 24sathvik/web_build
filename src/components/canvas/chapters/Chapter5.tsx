"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Chapter5() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 400;

  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        // Deterministic pseudo-random generation to avoid layout jumps
        const seed1 = Math.sin(i * 12.9898 + 78.233);
        const seed2 = Math.cos(i * 43.123 + 19.456);
        const frac1 = seed1 - Math.floor(seed1);
        const frac2 = seed2 - Math.floor(seed2);

        const x = (frac1 - 0.5) * 44;
        const z = (frac2 - 0.5) * 44;
        const h = Math.abs(Math.sin(i * 91.345)) * 6 + 1.2;
        
        dummy.position.set(x, h / 2 - 5, z);
        dummy.scale.set(1.2, h, 1.2);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy]);

  useFrame((state) => {
    if (meshRef.current) {
      // Slow rotation for cinematic skyline effect
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#060c18"
          emissive="#00D9FF"
          emissiveIntensity={0.28}
          roughness={0.2}
          metalness={0.85}
        />
      </instancedMesh>
    </group>
  );
}
