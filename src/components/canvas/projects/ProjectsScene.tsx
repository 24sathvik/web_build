"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { TorusKnot, Float, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function DataCore({ triggerId, scrollerId }: { triggerId: string, scrollerId: string }) {
  const coreRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useGSAP(() => {
    if (!coreRef.current) return;
    
    // Make sure elements exist before applying ScrollTrigger to avoid undefined _gsap errors
    if (typeof window !== 'undefined' && !document.querySelector(triggerId)) return;

    // As the user scrolls, the entire core rotates aggressively and scales up
    gsap.to(coreRef.current.rotation, {
      y: Math.PI * 2,
      z: Math.PI,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: triggerId,
        scroller: scrollerId,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    gsap.to(coreRef.current.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: triggerId,
        scroller: scrollerId,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
  }, { dependencies: [triggerId, scrollerId] });

  useFrame((state) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      outerRingRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  // Premium liquid glass material
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#050505",
    metalness: 0.9,
    roughness: 0.05,
    transmission: 1, // Add glass-like transparency
    thickness: 2,
    envMapIntensity: 2,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    emissive: "#00D9FF",
    emissiveIntensity: 0.2,
    wireframe: true,
  });

  return (
    <group ref={coreRef} position={[0, 0, 0]}>
      <Float speed={2} floatIntensity={1.5} rotationIntensity={2}>
        {/* The massive central Torus Knot */}
        <TorusKnot args={[3, 0.8, 256, 32]} material={glassMaterial} />
        
        {/* Inner solid glowing core */}
        <TorusKnot args={[2.5, 0.2, 128, 16]}>
          <meshStandardMaterial color="#6E5BFF" emissive="#6E5BFF" emissiveIntensity={2} />
        </TorusKnot>

        {/* Outer rotating ring */}
        <mesh ref={outerRingRef}>
          <torusGeometry args={[5, 0.05, 16, 100]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

export default function ProjectsScene({ 
  triggerId = "#overlay-container-projects", 
  scrollerId = "#scroll-container-projects" 
}: { 
  triggerId?: string; 
  scrollerId?: string; 
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <color attach="background" args={["#050505"]} />
      
      {/* Dynamic Background Stars */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
      
      {/* Strong lighting to illuminate the glass material */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={3} color="#00D9FF" />
      <directionalLight position={[-10, -10, -10]} intensity={3} color="#6E5BFF" />
      <pointLight position={[0, 0, 5]} intensity={10} color="#FFFFFF" distance={20} />

      <DataCore triggerId={triggerId} scrollerId={scrollerId} />

      {/* Heavy post-processing for a cinematic look */}
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2.5} mipmapBlur />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.005, 0.005)}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
    </Canvas>
  );
}
