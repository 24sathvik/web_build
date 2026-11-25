"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";

function HolographicCard({
  position,
  title,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  title: string;
  rotation?: [number, number, number];
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() + position[0]) * 0.2;
    }
  });

  return (
    <Float floatIntensity={1.5} speed={2}>
      <group position={position} rotation={rotation as any} scale={scale}>
        <mesh ref={meshRef}>
          <boxGeometry args={[2.2, 3.2, 0.1]} />
          <meshPhysicalMaterial
            color="#080c18"
            metalness={0.9}
            roughness={0.15}
            transmission={0.85}
            thickness={0.5}
            envMapIntensity={2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#00D9FF"
            emissiveIntensity={0.2}
            transparent
            opacity={0.88}
          />
        </mesh>
        <Text
          position={[0, 0, 0.08]}
          fontSize={0.22}
          color="#FFFFFF"
          maxWidth={1.9}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      </group>
    </Float>
  );
}

export default function Chapter4() {
  const { viewport } = useThree();
  const isNarrow = viewport.width < 7;

  if (isNarrow) {
    // Mobile responsive layout: scaled down, closer together so cards never clip off-screen
    return (
      <group>
        <HolographicCard position={[-1.2, 0.3, -1]} rotation={[0, 0.2, 0]} title="AI Development" scale={0.7} />
        <HolographicCard position={[0, -0.2, 0.5]} title="Cloud Engineering" scale={0.75} />
        <HolographicCard position={[1.2, 0.3, -1]} rotation={[0, -0.2, 0]} title="Automation Systems" scale={0.7} />
      </group>
    );
  }

  return (
    <group>
      <HolographicCard position={[-3.2, 0, -2]} rotation={[0, 0.2, 0]} title="AI Development" />
      <HolographicCard position={[0, 0, 0]} title="Cloud Engineering" />
      <HolographicCard position={[3.2, 0, -2]} rotation={[0, -0.2, 0]} title="Automation Systems" />
    </group>
  );
}
