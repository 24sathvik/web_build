"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Chapter5() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 400;

  useMemo(() => {
    // We generate positions on mount
    setTimeout(() => {
      if (meshRef.current) {
        for (let i = 0; i < count; i++) {
          const x = (Math.random() - 0.5) * 40;
          const z = (Math.random() - 0.5) * 40;
          const h = Math.random() * 5 + 1; // Building height
          
          dummy.position.set(x, h / 2 - 5, z);
          dummy.scale.set(1, h, 1);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    }, 0);
  }, [dummy]);

  useFrame((state) => {
    if (meshRef.current) {
      // Slow rotation for cinematic effect
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#050505"
          emissive="#00D9FF"
          emissiveIntensity={0.2}
          roughness={0.2}
          metalness={0.8}
          wireframe={Math.random() > 0.5}
        />
      </instancedMesh>
    </group>
  );
}
