"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useQualityTierContext } from "../SceneShell";

function yieldFrame(callback: () => void): () => void {
  let cancelled = false;
  const win = typeof window !== "undefined" ? (window as any) : null;

  if (win?.scheduler?.postTask) {
    win.scheduler.postTask(
      () => {
        if (!cancelled) callback();
      },
      { priority: "user-visible" }
    );
  } else if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(() => {
      if (!cancelled) callback();
    });
  } else {
    setTimeout(() => {
      if (!cancelled) callback();
    }, 16);
  }

  return () => {
    cancelled = true;
  };
}

export default function Chapter1() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const tier = useQualityTierContext();
  const isLite = tier === "lite";

  // Requirement 4: Build chapter objects across several frames (yield between steps with scheduler.postTask / RAF)
  // Stage 1: Core mesh
  // Stage 2: Outer Ring
  // Stage 3: Particles / Sparkles
  const [mountStage, setMountStage] = useState(isLite ? 1 : 3);

  useEffect(() => {
    if (mountStage >= 3) return;

    let cancel2: (() => void) | null = null;
    const cancel1 = yieldFrame(() => {
      setMountStage(2);
      cancel2 = yieldFrame(() => {
        setMountStage(3);
      });
    });

    return () => {
      cancel1();
      if (cancel2) cancel2();
    };
  }, [mountStage]);

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
        {/* Stage 1: ZYXEN Symbol Proxy - MeshBasicMaterial on lite (no PBR shader overhead) */}
        <mesh ref={coreRef} position={[0, 0, 0]}>
          <octahedronGeometry args={[1.5, 0]} />
          {isLite ? (
            <meshBasicMaterial color="#00D9FF" wireframe />
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

        {/* Stage 2: Outer Ring - lower segment count (args 8, 24 vs 16, 100) and MeshBasicMaterial on lite */}
        {mountStage >= 2 && (
          <mesh ref={ringRef}>
            <torusGeometry args={isLite ? [2.5, 0.05, 8, 24] : [2.5, 0.05, 16, 100]} />
            {isLite ? (
              <meshBasicMaterial color="#6E5BFF" />
            ) : (
              <meshStandardMaterial
                color="#6E5BFF"
                emissive="#6E5BFF"
                emissiveIntensity={1.5}
                metalness={1}
                roughness={0}
              />
            )}
          </mesh>
        )}
      </Float>

      {/* Stage 3: Particle System - 40 count on lite vs 500 on full */}
      {mountStage >= 3 && (
        <Sparkles
          count={isLite ? 40 : 500}
          scale={10}
          size={isLite ? 1.5 : 2}
          speed={0.4}
          opacity={0.5}
          color="#BFC7D5"
        />
      )}
    </group>
  );
}
