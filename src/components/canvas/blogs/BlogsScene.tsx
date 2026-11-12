"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import SceneShell, { useQualityTierContext } from "../SceneShell";
import { useOverlayScrollProgress, useStagePointer } from "../useStagePointer";
import type { BlogCard } from "@/components/dom/blogs/BlogsOverlay";
import { blogStore } from "@/lib/sceneSync";
import { createSeededRandom } from "@/lib/seededRandom";
import { isReducedMotion } from "@/lib/motion";

const CATEGORY_PALETTE = [
  "#00D9FF",
  "#6E5BFF",
  "#00FFB2",
  "#FF3D8B",
  "#FFB800",
];

function evaluateStreamPosition(
  t: number,
  catIdx: number,
  catCount: number,
  time: number,
  scrollParallax: number,
  out: THREE.Vector3
) {
  const safeCount = Math.max(catCount, 1);
  const strandAngle = (catIdx / safeCount) * Math.PI * 2 + t * 2.8 + time * 0.22;
  const braidRadius = 1.35 + 0.35 * Math.sin(t * Math.PI + time * 0.35);
  return out.set(
    t * 8.2,
    Math.cos(strandAngle) * braidRadius + Math.sin(t * 2.4 + catIdx) * 0.55 - scrollParallax * 1.4,
    Math.sin(strandAngle) * braidRadius * 0.85 - 1.2
  );
}

function buildStreamGeometry(
  particleCount: number,
  categories: string[],
  categoryColorMap: Map<string, THREE.Color>
): THREE.BufferGeometry {
  const catCount = Math.max(categories.length, 1);
  const positions = new Float32Array(particleCount * 3);
  const params = new Float32Array(particleCount * 4); // x: t, y: catIdx, z: phase, w: scatter
  const offsets = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const rand = createSeededRandom(7331);
  for (let i = 0; i < particleCount; i++) {
    const catIdx = i % catCount;
    const catName = categories[catIdx] || "General";
    const col = categoryColorMap.get(catName) ?? new THREE.Color("#00D9FF");

    const r1 = rand();
    const r2 = rand();
    const r3 = rand();
    const r4 = rand();

    const t = r1 * 2 - 1; // [-1, 1] along stream
    const radialAngle = r2 * Math.PI * 2;
    const radialDist = 0.06 + r3 * 0.38;

    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;

    params[i * 4] = t;
    params[i * 4 + 1] = catIdx;
    params[i * 4 + 2] = r4 * Math.PI * 2;
    params[i * 4 + 3] = 0.65 + r3 * 0.85;

    offsets[i * 3] = (r1 - 0.5) * 0.14;
    offsets[i * 3 + 1] = Math.cos(radialAngle) * radialDist;
    offsets[i * 3 + 2] = Math.sin(radialAngle) * radialDist;

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aParams", new THREE.BufferAttribute(params, 4));
  geo.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  // Explicit generous bounding sphere so frustum culling never clips shader-displaced points
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -1.2), 18);
  return geo;
}

const STREAM_VERT = /* glsl */ `
  attribute vec4 aParams;
  attribute vec3 aOffset;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uCatCount;
  uniform float uActiveCat;
  uniform float uScrollParallax;
  uniform float uPointScale;
  uniform vec3 uPointer;
  uniform float uPointerStrength;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float t = aParams.x;
    float catIdx = aParams.y;
    float phase = aParams.z;
    float sizeFactor = aParams.w;

    float strandAngle = (catIdx / max(uCatCount, 1.0)) * 6.2831853 + t * 2.8 + uTime * 0.22;
    float braidRadius = 1.35 + 0.35 * sin(t * 3.14159 + uTime * 0.35);

    vec3 center = vec3(
      t * 8.2,
      cos(strandAngle) * braidRadius + sin(t * 2.4 + catIdx) * 0.55 - uScrollParallax * 1.4,
      sin(strandAngle) * braidRadius * 0.85 - 1.2
    );

    vec3 swirl = vec3(
      aOffset.x,
      aOffset.y + sin(uTime * 1.1 + phase) * 0.08,
      aOffset.z + cos(uTime * 0.9 + phase) * 0.08
    );

    vec3 worldPos = center + swirl;

    // Pointer repulsion in stream space
    vec2 diff = worldPos.xy - uPointer.xy;
    float dist = length(diff);
    float push = smoothstep(2.4, 0.0, dist) * uPointerStrength;
    worldPos.xy += normalize(diff + vec2(0.0001)) * push * 0.95;
    worldPos.z += push * 0.45;

    float edgeFade = smoothstep(-1.0, -0.78, t) * (1.0 - smoothstep(0.78, 1.0, t));

    float boost = 1.0;
    float dimFactor = 1.0;
    if (uActiveCat >= -0.5) {
      if (abs(catIdx - uActiveCat) < 0.25) {
        boost = 1.55;
      } else {
        dimFactor = 0.42;
      }
    }

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    vColor = mix(aColor, vec3(1.0), (boost - 1.0) * 0.35);
    vAlpha = edgeFade * dimFactor * (0.72 + 0.28 * sin(uTime * 1.8 + phase));

    float pxSize = (36.0 * sizeFactor * uPointScale * boost) / max(-mvPos.z, 1.0);
    gl_PointSize = clamp(pxSize, 2.2, 12.0);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const STREAM_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    float circle = smoothstep(0.5, 0.06, dist);
    if (circle < 0.02) discard;
    gl_FragColor = vec4(vColor * 1.25, circle * vAlpha * 0.94);
  }
`;

function SignalStreamContent({ posts }: { posts: BlogCard[] }) {
  const tier = useQualityTierContext();
  const isLite = tier === "lite";
  const router = useRouter();
  const { size, camera } = useThree();

  const groupRef = useRef<THREE.Group>(null);
  const orbsRef = useRef<THREE.InstancedMesh>(null);
  const halosRef = useRef<THREE.InstancedMesh>(null);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category || "General"))),
    [posts]
  );

  const categoryColorMap = useMemo(() => {
    const map = new Map<string, THREE.Color>();
    categories.forEach((cat, idx) => {
      map.set(cat, new THREE.Color(CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]));
    });
    return map;
  }, [categories]);

  const orbScalesRef = useRef<number[]>(posts.map(() => 1));
  const orbWorldPositions = useMemo(
    () => posts.map(() => new THREE.Vector3()),
    [posts]
  );

  const smoothYaw = useRef(0);
  const dragInertia = useRef(0);
  const dragAngle = useRef(0);
  const lastDragX = useRef(0);
  const smoothScroll = useRef(0);
  const smoothPointerStrength = useRef(0);

  const scrollProgressRef = useOverlayScrollProgress(
    "scroll-container-blogs",
    "overlay-container-blogs"
  );

  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      proj: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      mat: new THREE.Matrix4(),
      pointerWorld: new THREE.Vector3(),
    }),
    []
  );

  const particleCount = isLite ? 1500 : 3600;
  const streamGeo = useMemo(
    () => buildStreamGeometry(particleCount, categories, categoryColorMap),
    [particleCount, categories, categoryColorMap]
  );

  const streamMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: STREAM_VERT,
        fragmentShader: STREAM_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uCatCount: { value: Math.max(categories.length, 1) },
          uActiveCat: { value: -1 },
          uScrollParallax: { value: 0 },
          uPointScale: { value: isLite ? 1.15 : 1.0 },
          uPointer: { value: new THREE.Vector3(0, 0, -1.2) },
          uPointerStrength: { value: 0 },
        },
      }),
    [categories.length, isLite]
  );

  const orbGeo = useMemo(() => new THREE.SphereGeometry(0.11, isLite ? 12 : 20, isLite ? 10 : 16), [isLite]);
  const orbMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#FFFFFF", toneMapped: false }),
    []
  );

  const haloGeo = useMemo(() => new THREE.RingGeometry(0.17, 0.21, isLite ? 18 : 28), [isLite]);
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FFFFFF",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72,
        toneMapped: false,
      }),
    []
  );

  // Set per-orb category colors once on mount
  useEffect(() => {
    if (!orbsRef.current || !halosRef.current) return;
    posts.forEach((post, idx) => {
      const col = categoryColorMap.get(post.category || "General") ?? new THREE.Color("#00D9FF");
      orbsRef.current!.setColorAt(idx, col);
      halosRef.current!.setColorAt(idx, col);
    });
    if (orbsRef.current.instanceColor) orbsRef.current.instanceColor.needsUpdate = true;
    if (halosRef.current.instanceColor) halosRef.current.instanceColor.needsUpdate = true;
  }, [posts, categoryColorMap, isLite]);

  // GPU cleanup on unmount / tier swap
  useEffect(() => {
    return () => {
      streamGeo.dispose();
      streamMat.dispose();
    };
  }, [streamGeo, streamMat]);

  useEffect(() => {
    return () => {
      orbGeo.dispose();
      orbMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
    };
  }, [orbGeo, orbMat, haloGeo, haloMat]);

  const pickOrbAt = (clientX: number, clientY: number, maxRadiusPx: number): BlogCard | null => {
    const group = groupRef.current;
    if (!group) return null;
    let bestPost: BlogCard | null = null;
    let bestDist = maxRadiusPx;

    for (let i = 0; i < posts.length; i++) {
      scratch.proj.copy(orbWorldPositions[i]).applyMatrix4(group.matrixWorld).project(camera);
      if (scratch.proj.z > 1) continue;
      const sx = (scratch.proj.x * 0.5 + 0.5) * size.width;
      const sy = (-scratch.proj.y * 0.5 + 0.5) * size.height;
      const dist = Math.hypot(sx - clientX, sy - clientY);
      if (dist < bestDist) {
        bestDist = dist;
        bestPost = posts[i];
      }
    }
    return bestPost;
  };

  const pointerRef = useStagePointer("scroll-container-blogs", {
    onTap: (cx, cy) => {
      const hitPost = pickOrbAt(cx, cy, 48);
      if (hitPost) {
        blogStore.set({
          hoveredSlug: hitPost.slug,
          hoveredCategory: hitPost.category,
        });
        router.push(`/blogs/${hitPost.slug}`);
      }
    },
    sensitivityX: 0.004,
  });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    const pState = pointerRef.current;
    const syncState = blogStore.get();
    const reduced = isReducedMotion();

    // Smooth drag yaw + inertia + subtle scroll parallax
    const deltaX = pState.offsetX - lastDragX.current;
    lastDragX.current = pState.offsetX;
    if (pState.isDragging) {
      dragInertia.current = deltaX;
    } else {
      dragInertia.current = THREE.MathUtils.damp(dragInertia.current, 0, 5.0, dt);
    }
    dragAngle.current = THREE.MathUtils.clamp(dragAngle.current + dragInertia.current, -0.55, 0.55);

    smoothYaw.current = THREE.MathUtils.damp(
      smoothYaw.current,
      dragAngle.current + (reduced ? 0 : pState.ndcX * 0.08),
      4.5,
      dt
    );
    smoothScroll.current = THREE.MathUtils.damp(
      smoothScroll.current,
      scrollProgressRef.current,
      5.0,
      dt
    );

    group.rotation.y = smoothYaw.current;
    group.updateMatrixWorld();

    // Map pointer NDC into approximate stream world coordinates for particle repulsion
    const targetPointerX = pState.ndcX * 5.6;
    const targetPointerY = pState.ndcY * 3.1;
    scratch.pointerWorld.set(targetPointerX, targetPointerY, -1.2);
    streamMat.uniforms.uPointer.value.lerp(scratch.pointerWorld, Math.min(1, dt * 10));

    smoothPointerStrength.current = THREE.MathUtils.damp(
      smoothPointerStrength.current,
      pState.hasPointer && !reduced ? 1.0 : 0.0,
      6.0,
      dt
    );

    const activeCatName = syncState.domHoveredCategory || syncState.hoveredCategory;
    const activeCatIdx = activeCatName ? categories.indexOf(activeCatName) : -1;

    streamMat.uniforms.uTime.value = reduced ? 0 : elapsed;
    streamMat.uniforms.uActiveCat.value = activeCatIdx;
    streamMat.uniforms.uScrollParallax.value = smoothScroll.current;
    streamMat.uniforms.uPointerStrength.value = smoothPointerStrength.current;

    const activeSlug = syncState.domHoveredSlug || syncState.hoveredSlug;

    // Update post orbs drifting along their respective category streams
    if (orbsRef.current && halosRef.current) {
      const catCount = Math.max(categories.length, 1);
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const catIdx = Math.max(0, categories.indexOf(post.category || "General"));
        const raw = ((i / Math.max(posts.length, 1)) + (reduced ? 0 : elapsed * 0.028)) % 1;
        const t = (raw * 2 - 1) * 0.86;
        const edgeFadeScale =
          THREE.MathUtils.smoothstep(raw, 0, 0.09) *
          THREE.MathUtils.smoothstep(1 - raw, 0, 0.09);

        evaluateStreamPosition(
          t,
          catIdx,
          catCount,
          reduced ? 0 : elapsed,
          smoothScroll.current,
          scratch.pos
        );
        orbWorldPositions[i].copy(scratch.pos);

        const isFocused = activeSlug === post.slug;
        const targetOrbScale = (isFocused ? 1.72 : 1.0) * Math.max(0.05, edgeFadeScale);
        orbScalesRef.current[i] = THREE.MathUtils.damp(
          orbScalesRef.current[i],
          targetOrbScale,
          7.5,
          dt
        );
        const s = orbScalesRef.current[i];

        scratch.quat.identity();
        scratch.scale.set(s, s, s);
        scratch.mat.compose(scratch.pos, scratch.quat, scratch.scale);
        orbsRef.current.setMatrixAt(i, scratch.mat);

        const haloPulse = 1 + Math.sin(elapsed * 2.8 + i) * 0.14;
        const hs = s * (isFocused ? 1.45 : 1.05) * haloPulse;
        scratch.quat.copy(camera.quaternion);
        scratch.scale.set(hs, hs, hs);
        scratch.mat.compose(scratch.pos, scratch.quat, scratch.scale);
        halosRef.current.setMatrixAt(i, scratch.mat);
      }
      orbsRef.current.instanceMatrix.needsUpdate = true;
      halosRef.current.instanceMatrix.needsUpdate = true;
    }

    // Hover picking over projected orbs
    if (pState.hasPointer && !pState.overDomControl && !pState.isDragging) {
      const hitPost = pickOrbAt(pState.clientX, pState.clientY, 44);
      const nextSlug = hitPost?.slug ?? null;
      const nextCat = hitPost?.category ?? null;
      if (nextSlug !== syncState.hoveredSlug) {
        blogStore.set({ hoveredSlug: nextSlug, hoveredCategory: nextCat });
      }
    } else if (pState.overDomControl && syncState.hoveredSlug !== null) {
      blogStore.set({ hoveredSlug: null, hoveredCategory: null });
    }

    // Reposition external DOM title chip without React renders
    const chipEl = document.getElementById("blog-orb-chip");
    if (chipEl && syncState.hoveredSlug) {
      const idx = posts.findIndex((p) => p.slug === syncState.hoveredSlug);
      if (idx !== -1) {
        scratch.proj
          .copy(orbWorldPositions[idx])
          .applyMatrix4(group.matrixWorld)
          .project(camera);
        if (scratch.proj.z <= 1) {
          const sx = THREE.MathUtils.clamp(
            (scratch.proj.x * 0.5 + 0.5) * size.width,
            135,
            Math.max(150, size.width - 135)
          );
          const sy = THREE.MathUtils.clamp(
            (-scratch.proj.y * 0.5 + 0.5) * size.height - 16,
            72,
            Math.max(90, size.height - 96)
          );
          chipEl.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
        }
      }
    }
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />

      <group ref={groupRef}>
        <points geometry={streamGeo} material={streamMat} />
        {posts.length > 0 && (
          <>
            <instancedMesh ref={orbsRef} args={[orbGeo, orbMat, posts.length]} />
            <instancedMesh ref={halosRef} args={[haloGeo, haloMat, posts.length]} />
          </>
        )}
      </group>

      {tier === "full" && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.85} intensity={1.3} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

export default function BlogsScene({
  posts,
  triggerTime,
}: {
  posts: BlogCard[];
  triggerTime?: number | null;
}) {
  return (
    <SceneShell
      triggerTime={triggerTime}
      camera={{ position: [0, 0.1, 8.8], fov: 46 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <SignalStreamContent posts={posts} />
    </SceneShell>
  );
}

