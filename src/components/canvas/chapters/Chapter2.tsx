"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sphere, Trail } from "@react-three/drei";
import * as THREE from "three";

export default function Chapter2() {
  const coreRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
      coreRef.current.rotation.x = t * 0.2;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y = -t * 0.1;
      shellRef.current.rotation.x = -t * 0.1;
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <group ref={coreRef}>
          {/* Inner Energy Core */}
          <Sphere args={[1, 32, 32]}>
            <meshStandardMaterial
              color="#00D9FF"
              emissive="#00D9FF"
              emissiveIntensity={2}
              transparent
              opacity={0.8}
            />
          </Sphere>
          
          {/* Orbiting Energy Particles */}
          <Trail width={5} length={8} color={new THREE.Color(2, 10, 10)} attenuation={(t) => t * t}>
            <mesh position={[1.5, 0, 0]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </Trail>
          <Trail width={5} length={8} color={new THREE.Color(10, 2, 10)} attenuation={(t) => t * t}>
            <mesh position={[-1.5, 0, 0]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </Trail>
        </group>

        {/* Outer Tech Shell */}
        <mesh ref={shellRef}>
          <icosahedronGeometry args={[2, 1]} />
          <meshPhysicalMaterial
            color="#050505"
            metalness={0.9}
            roughness={0.1}
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>
    </group>
  );
}
