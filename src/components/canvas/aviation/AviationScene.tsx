"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Torus } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function FlightRadarMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useGSAP(() => {
    if (!groupRef.current) return;
    if (typeof window !== "undefined" && !document.querySelector("#overlay-container-aviation")) return;

    // As user scrolls through aviation page, rotate radar rings and push scene forward
    gsap.to(groupRef.current.rotation, {
      y: Math.PI * 1.5,
      x: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: "#overlay-container-aviation",
        scroller: "#scroll-container-aviation",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    gsap.to(groupRef.current.position, {
      z: 5,
      ease: "none",
      scrollTrigger: {
        trigger: "#overlay-container-aviation",
        scroller: "#scroll-container-aviation",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef1.current) {
      ringRef1.current.rotation.z = t * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -t * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        {/* Central navigational compass rings */}
        <mesh ref={ringRef1}>
          <torusGeometry args={[4, 0.03, 16, 100]} />
          <meshBasicMaterial color="#00D9FF" transparent opacity={0.6} />
        </mesh>

        <mesh ref={ringRef2} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[5.5, 0.02, 16, 100]} />
          <meshBasicMaterial color="#6E5BFF" transparent opacity={0.4} />
        </mesh>

        <Torus args={[2.5, 0.04, 16, 80]} rotation={[0, Math.PI / 3, 0]}>
          <meshStandardMaterial color="#00D9FF" emissive="#00D9FF" emissiveIntensity={0.8} />
        </Torus>

        {/* Core marker */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#00D9FF" emissiveIntensity={2} />
        </mesh>
      </Float>
    </group>
  );
}

export default function AviationScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <color attach="background" args={["#050505"]} />
      <Stars radius={80} depth={40} count={2500} factor={3} saturation={1} fade speed={1.5} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={2} color="#00D9FF" />
      <pointLight position={[0, 0, 4]} intensity={5} color="#6E5BFF" distance={15} />

      <FlightRadarMesh />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
