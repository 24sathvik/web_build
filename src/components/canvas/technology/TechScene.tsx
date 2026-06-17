"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function CircuitBoard() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate random circuit paths
  const circuits = useMemo(() => {
    const paths: THREE.Vector3[][] = [];
    const nodes: THREE.Vector3[] = [];
    
    for (let i = 0; i < 20; i++) {
      const startX = (Math.random() - 0.5) * 20;
      const startZ = (Math.random() - 0.5) * 20;
      
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
  }, []);

  useGSAP(() => {
    if (!groupRef.current) return;
    
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
        <Line key={idx} points={path} color="#00D9FF" lineWidth={2} transparent opacity={0.6} />
      ))}
      
      {/* Circuit Nodes */}
      {circuits.nodes.map((node, idx) => (
        <mesh key={idx} position={node}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#6E5BFF" />
        </mesh>
      ))}

      {/* Main Grid Plane */}
      <gridHelper args={[50, 50, "#333333", "#111111"]} position={[0, -0.1, 0]} />
    </group>
  );
}

export default function TechScene() {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 60 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 10, 30]} />
      
      <ambientLight intensity={0.5} />

      <CircuitBoard />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={2.5} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
