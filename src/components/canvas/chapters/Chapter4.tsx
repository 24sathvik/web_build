"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";
import { useQualityTierContext } from "../SceneShell";

function HolographicCard({
  position,
  title,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  title: string;
  rotation?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tier = useQualityTierContext();
  const isLite = tier === "lite";

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.getElapsedTime() + position[0]) * 0.2;
    }
  });

  return (
    <Float floatIntensity={isLite ? 1 : 2} speed={isLite ? 1.5 : 2}>
      <group position={position} rotation={rotation as any}>
        <mesh ref={meshRef}>
          <boxGeometry args={[2, 3, 0.1]} />
          {isLite ? (
            <meshStandardMaterial
              color="#080808"
              metalness={0.8}
              roughness={0.2}
              emissive="#00D9FF"
              emissiveIntensity={0.2}
              transparent
              opacity={0.85}
            />
          ) : (
            <meshPhysicalMaterial
              color="#050505"
              metalness={0.9}
              roughness={0.1}
              transmission={0.9}
              thickness={0.5}
              envMapIntensity={2}
              clearcoat={1}
              clearcoatRoughness={0.1}
              emissive="#00D9FF"
              emissiveIntensity={0.1}
              transparent
              opacity={0.8}
            />
          )}
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.2}
          color="#FFFFFF"
          maxWidth={1.8}
          textAlign="center"
        >
          {title}
        </Text>
      </group>
    </Float>
  );
}

export default function Chapter4() {
  return (
    <group>
      <HolographicCard position={[-3, 0, -2]} rotation={[0, 0.2, 0]} title="AI Development" />
      <HolographicCard position={[0, 0, 0]} title="Cloud Engineering" />
      <HolographicCard position={[3, 0, -2]} rotation={[0, -0.2, 0]} title="Automation Systems" />
    </group>
  );
}
