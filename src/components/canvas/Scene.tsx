"use client";

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { debugStore } from "@/lib/debugState";

import Chapter1 from "./chapters/Chapter1";
const Chapter2 = lazy(() => import("./chapters/Chapter2"));
const Chapter3 = lazy(() => import("./chapters/Chapter3"));
const Chapter4 = lazy(() => import("./chapters/Chapter4"));
const Chapter5 = lazy(() => import("./chapters/Chapter5"));
import CameraRig from "./CameraRig";
import SceneShell, { useQualityTierContext, useHasFirstFrame } from "./SceneShell";

function SceneEffects() {
  const tier = useQualityTierContext();
  const hasFirstFrame = useHasFirstFrame();
  if (tier !== "full" || !hasFirstFrame) return null;

  return (
    <EffectComposer multisampling={0} resolutionScale={0.65}>
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

// Requirement 4: Call gl.compileAsync for each chapter before showing it
function CompiledChapter({
  index,
  children,
  position,
}: {
  index: number;
  children: React.ReactNode;
  position: [number, number, number];
}) {
  const { gl, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const runCompilation = async () => {
      // Yield before compiling so initial hydration & paint are never blocked
      if (typeof window !== "undefined" && "scheduler" in window && (window as any).scheduler?.yield) {
        try {
          await (window as any).scheduler.yield();
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      if (cancelled) return;

      if (groupRef.current && typeof (gl as any).compileAsync === "function") {
        try {
          await (gl as any).compileAsync(groupRef.current, camera);
        } catch { }
      }

      if (!cancelled) {
        setReady(true);
      }
    };

    runCompilation();

    return () => {
      cancelled = true;
    };
  }, [gl, camera]);

  return (
    <group ref={groupRef} position={position} visible={index === 1 ? true : ready}>
      {children}
    </group>
  );
}

function SceneContent() {
  const tier = useQualityTierContext();
  const hasFirstFrame = useHasFirstFrame();
  // Requirement 3: Progressive chapters on the home scene.
  // Mount Chapter 1 first; mount Chapter N+1 when scroll progress is within one chapter of it.
  // Handle page restore and anchor jumps by mounting up to current + 1. Once mounted, never unmount.
  const [mountedChapters, setMountedChapters] = useState(1);

  useEffect(() => {
    const updateChapters = () => {
      const scrollEl = document.getElementById("scroll-container");
      if (!scrollEl) return;
      const overlayEl = document.getElementById("overlay-container");
      const contentHeight = overlayEl ? overlayEl.offsetHeight : scrollEl.scrollHeight;
      const maxScroll = contentHeight - scrollEl.clientHeight;
      if (maxScroll <= 0) return;
      const progress = Math.min(1, Math.max(0, scrollEl.scrollTop / maxScroll));

      let target = 1;
      if (progress > 0.01) {
        // Chapters 1..5 mapped across 0..1 scroll range
        const current = Math.min(5, Math.floor(progress * 4) + 1);
        target = Math.min(5, current + 1);
      }

      setMountedChapters((prev) => Math.max(prev, target));
    };

    updateChapters();

    const scrollEl = document.getElementById("scroll-container");
    if (scrollEl) {
      scrollEl.addEventListener("scroll", updateChapters, { passive: true });
      return () => scrollEl.removeEventListener("scroll", updateChapters);
    }
  }, []);

  useEffect(() => {
    debugStore.set({ mountedChapters });
  }, [mountedChapters]);

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 5, 30]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <spotLight position={[-10, 10, -5]} intensity={2} color="#00D9FF" angle={0.5} penumbra={1} />

      {/* Local Environment: full tier only; tuned to replicate city HDR reflections without external download */}
      {tier === "full" && hasFirstFrame && (
        <Environment resolution={64} frames={1}>
          {/* Overhead sky fill */}
          <Lightformer form="rect" intensity={2} position={[0, 10, 2]} scale={[20, 10, 1]} target={[0, 0, 0]} />
          {/* Lateral specular lightformers mimicking high-rise window reflections */}
          <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[12, 6, 2]} scale={[12, 6, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={3} color="#00D9FF" position={[-12, 6, -2]} scale={[12, 6, 1]} target={[0, 0, 0]} />
          {/* Accent horizon ring */}
          <Lightformer form="ring" color="#6E5BFF" intensity={2} position={[0, -6, 4]} scale={14} />
          {/* Back rim highlight */}
          <Lightformer form="rect" color="#00FFB2" intensity={1.5} position={[0, 8, -10]} scale={[15, 4, 1]} />
        </Environment>
      )}

      {/* GSAP Controlled Camera Rig */}
      <CameraRig />

      {/* Progressive Chapters: compiled asynchronously before display; never unmounted */}
      {mountedChapters >= 1 && (
        <CompiledChapter index={1} position={[0, 0, 0]}>
          <Chapter1 />
        </CompiledChapter>
      )}
      <Suspense fallback={null}>
        {mountedChapters >= 2 && (
          <CompiledChapter index={2} position={[0, -20, 0]}>
            <Chapter2 />
          </CompiledChapter>
        )}
        {mountedChapters >= 3 && (
          <CompiledChapter index={3} position={[0, -40, 0]}>
            <Chapter3 />
          </CompiledChapter>
        )}
        {mountedChapters >= 4 && (
          <CompiledChapter index={4} position={[0, -60, 0]}>
            <Chapter4 />
          </CompiledChapter>
        )}
        {mountedChapters >= 5 && (
          <CompiledChapter index={5} position={[0, -80, 0]}>
            <Chapter5 />
          </CompiledChapter>
        )}
      </Suspense>

      {/* Post Processing: only active on full tier */}
      <SceneEffects />
    </>
  );
}

export default function Scene({ triggerTime }: { triggerTime?: number | null }) {
  return (
    <SceneShell
      triggerTime={triggerTime}
      shadows={false}
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
