"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useQualityTierContext } from "../SceneShell";
import { createSeededRandom } from "@/lib/seededRandom";

export default function Chapter5() {
  const tier = useQualityTierContext();
  const isLite = tier === "lite";
  const count = isLite ? 100 : 400;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const rng = createSeededRandom(77);
    const items = [];
    for (let i = 0; i < count; i++) {
      const x = (rng() - 0.5) * 40;
      const z = (rng() - 0.5) * 40;
      const h = rng() * 5 + 1; // Building height
      items.push({ x, z, h });
    }
    return items;
  }, [count]);

  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < data.length; i++) {
        const { x, z, h } = data[i];
        dummy.position.set(x, h / 2 - 5, z);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, dummy]);

  useFrame((state) => {
    if (meshRef.current) {
      // Slow rotation for cinematic effect
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group>
      <instancedMesh key={count} ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#050505"
          emissive="#00D9FF"
          emissiveIntensity={0.2}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
        />
      </instancedMesh>
    </group>
  );
}
