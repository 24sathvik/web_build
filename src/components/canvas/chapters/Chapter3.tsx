"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Line } from "@react-three/drei";
import * as THREE from "three";

export default function Chapter3() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate random nodes for the ecosystem
  const { positions, lines } = useMemo(() => {
    const pos = new Float32Array(50 * 3);
    const linePoints: THREE.Vector3[][] = [];
    
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 8;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    
    // Connect some nearby nodes
    for (let i = 0; i < 50; i++) {
      for (let j = i + 1; j < 50; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < 2.5) {
          linePoints.push([
            new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]),
            new THREE.Vector3(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]),
          ]);
        }
      }
    }
    
    return { positions: pos, lines: linePoints };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00D9FF"
          size={0.1}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
      {lines.map((line, idx) => (
        <Line
          key={idx}
          points={line}
          color="#6E5BFF"
          lineWidth={0.5}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
}
