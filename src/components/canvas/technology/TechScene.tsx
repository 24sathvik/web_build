"use client";

import { Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SceneShell, { useQualityTierContext } from "../SceneShell";
import { createSeededRandom } from "@/lib/seededRandom";
import { isReducedMotion } from "@/lib/motion";

function CircuitBoard() {
  const groupRef = useRef<THREE.Group>(null);
  const tier = useQualityTierContext();
  const isLite = tier === "lite";
  const circuitCount = isLite ? 5 : 20;
  
  // Generate deterministic circuit paths using seeded PRNG
  const circuits = useMemo(() => {
    const rng = createSeededRandom(1234);
    const paths: THREE.Vector3[][] = [];
    const nodes: THREE.Vector3[] = [];
    
    for (let i = 0; i < circuitCount; i++) {
      const startX = (rng() - 0.5) * 20;
      const startZ = (rng() - 0.5) * 20;
      
      const path = [
        new THREE.Vector3(startX, 0, startZ),
        new THREE.Vector3(startX, 0, startZ + 5),
        new THREE.Vector3(startX + 5, 0, startZ + 5),
      ];
      
      paths.push(path);
      nodes.push(new THREE.Vector3(startX, 0, startZ));
      nodes.push(new THREE.Vector3(startX + 5, 0, startZ + 5));
    }
    return { paths, nodes };
  }, [circuitCount]);

  useGSAP(() => {
    if (!groupRef.current) return;
    if (isReducedMotion()) return;
    
    // Animate the circuit board moving towards the camera
    gsap.to(groupRef.current.position, {
      z: 15,
      ease: "none",
      scrollTrigger: {
        trigger: "#overlay-container-tech",
        scroller: "#scroll-container-tech",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
  });

  return (
    <group ref={groupRef} position={[0, -2, -10]}>
      {/* Circuit Traces */}
      {circuits.paths.map((path, idx) => (
        <Line key={idx} points={path} color="#00D9FF" lineWidth={isLite ? 1.5 : 2} transparent opacity={0.6} />
      ))}
      
      {/* Circuit Nodes */}
      {circuits.nodes.map((node, idx) => (
        <mesh key={idx} position={node}>
          <sphereGeometry args={[0.1, isLite ? 8 : 16, isLite ? 8 : 16]} />
          <meshBasicMaterial color="#6E5BFF" />
        </mesh>
      ))}

      {/* Main Grid Plane */}
      <gridHelper args={[50, isLite ? 25 : 50, "#333333", "#111111"]} position={[0, -0.1, 0]} />
    </group>
  );
}

function TechContent() {
  const tier = useQualityTierContext();
  const isLite = tier === "lite";

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 10, 30]} />
      
      <ambientLight intensity={0.5} />

      <CircuitBoard />

      {tier === "full" && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={2.5} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

export default function TechScene({ triggerTime }: { triggerTime?: number | null }) {
  return (
    <SceneShell
      triggerTime={triggerTime}
      camera={{ position: [0, 5, 10], fov: 60 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <TechContent />
    </SceneShell>
  );
}
