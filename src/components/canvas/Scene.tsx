"use client";

import { Environment, Lightformer, Preload } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

import Chapter1 from "./chapters/Chapter1";
import Chapter2 from "./chapters/Chapter2";
import Chapter3 from "./chapters/Chapter3";
import Chapter4 from "./chapters/Chapter4";
import Chapter5 from "./chapters/Chapter5";
import CameraRig from "./CameraRig";
import SceneShell, { useQualityTierContext } from "./SceneShell";

function SceneEffects() {
  const tier = useQualityTierContext();
  const isLite = tier === "lite";

  if (isLite) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          intensity={1.2} 
          mipmapBlur 
        />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        intensity={1.5} 
        mipmapBlur 
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.002, 0.002)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
}

function SceneContent() {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 5, 30]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <spotLight position={[-10, 10, -5]} intensity={2} color="#00D9FF" angle={0.5} penumbra={1} />
      
      {/* Local Environment: no external HDR download */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.5} position={[10, 5, 0]} scale={[10, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2} color="#00D9FF" position={[-10, 5, 0]} scale={[10, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" color="#6E5BFF" intensity={1} position={[0, -5, 5]} scale={10} />
      </Environment>

      {/* GSAP Controlled Camera Rig */}
      <CameraRig />

      {/* Chapters (3D Scenes) */}
      <group position={[0, 0, 0]}>
        <Chapter1 />
      </group>
      <group position={[0, -20, 0]}>
        <Chapter2 />
      </group>
      <group position={[0, -40, 0]}>
        <Chapter3 />
      </group>
      <group position={[0, -60, 0]}>
        <Chapter4 />
      </group>
      <group position={[0, -80, 0]}>
        <Chapter5 />
      </group>

      {/* Post Processing */}
      <SceneEffects />

      <Preload all />
    </>
  );
}

export default function Scene() {
  return (
    <SceneShell
      shadows
      camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 1000 }}
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: true,
      }}
    >
      <SceneContent />
    </SceneShell>
  );
}
