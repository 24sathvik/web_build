"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import SceneShell, { useQualityTierContext } from "../SceneShell";
import { useOverlayScrollProgress, useStagePointer } from "../useStagePointer";
import { aviationStore } from "@/lib/sceneSync";
import { isReducedMotion } from "@/lib/motion";

const GLOBE_RADIUS = 2.65;
const DEG2RAD = Math.PI / 180;

interface GeoPoint {
  code: string;
  label: string;
  lat: number;
  lon: number;
  color: string;
  isAuthority: boolean;
  arcLift: number;
  dir: THREE.Vector3;
  pos: THREE.Vector3;
}

function latLonToDir(lat: number, lon: number): THREE.Vector3 {
  const latRad = lat * DEG2RAD;
  const lonRad = lon * DEG2RAD;
  return new THREE.Vector3(
    Math.cos(latRad) * Math.sin(lonRad),
    Math.sin(latRad),
    Math.cos(latRad) * Math.cos(lonRad)
  ).normalize();
}

const RAW_NODES: Omit<GeoPoint, "dir" | "pos">[] = [
  {
    code: "HYD",
    label: "Hyderabad Hub",
    lat: 17.385,
    lon: 78.487,
    color: "#FFFFFF",
    isAuthority: false,
    arcLift: 0,
  },
  {
    code: "DGCA",
    label: "New Delhi (DGCA)",
    lat: 28.614,
    lon: 77.209,
    color: "#00D9FF",
    isAuthority: true,
    arcLift: 0.42,
  },
  {
    code: "FAA",
    label: "Washington DC (FAA)",
    lat: 38.907,
    lon: -77.037,
    color: "#6E5BFF",
    isAuthority: true,
    arcLift: 1.05,
  },
  {
    code: "EASA",
    label: "Cologne (EASA)",
    lat: 50.938,
    lon: 6.96,
    color: "#00FFB2",
    isAuthority: true,
    arcLift: 0.78,
  },
];

const GEO_NODES: GeoPoint[] = RAW_NODES.map((n) => {
  const dir = latLonToDir(n.lat, n.lon);
  return {
    ...n,
    dir,
    pos: dir.clone().multiplyScalar(GLOBE_RADIUS * 1.01),
  };
});

const HYD_NODE = GEO_NODES[0];
const AUTHORITY_NODES = GEO_NODES.filter((n) => n.isAuthority);

function buildFibonacciDots(count: number) {
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const weights = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Deterministic spherical harmonic mask so landmasses read as clustered bands
    const lat = Math.asin(y);
    const lon = Math.atan2(x, z);
    const mask =
      Math.sin(lon * 2.3 + 0.5) * Math.cos(lat * 2.1 - 0.3) +
      0.55 * Math.cos(lon * 4.7 - lat * 3.1) +
      0.35 * Math.sin(lat * 5.2 + lon * 1.8);
    const weight = mask > 0.12 ? 1.0 : 0.32;

    positions[i * 3] = x * GLOBE_RADIUS;
    positions[i * 3 + 1] = y * GLOBE_RADIUS;
    positions[i * 3 + 2] = z * GLOBE_RADIUS;

    normals[i * 3] = x;
    normals[i * 3 + 1] = y;
    normals[i * 3 + 2] = z;

    weights[i] = weight;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aNormal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("aWeight", new THREE.BufferAttribute(weights, 1));
  return geometry;
}

class GreatCircleArcCurve extends THREE.Curve<THREE.Vector3> {
  private startDir: THREE.Vector3;
  private endDir: THREE.Vector3;
  private lift: number;
  private angle: number;

  constructor(startDir: THREE.Vector3, endDir: THREE.Vector3, lift: number) {
    super();
    this.startDir = startDir.clone().normalize();
    this.endDir = endDir.clone().normalize();
    this.lift = lift;
    this.angle = Math.acos(THREE.MathUtils.clamp(this.startDir.dot(this.endDir), -1, 1));
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const sinA = Math.sin(this.angle);
    if (sinA < 1e-4) {
      optionalTarget.copy(this.startDir);
    } else {
      const w0 = Math.sin((1 - t) * this.angle) / sinA;
      const w1 = Math.sin(t * this.angle) / sinA;
      optionalTarget
        .set(0, 0, 0)
        .addScaledVector(this.startDir, w0)
        .addScaledVector(this.endDir, w1)
        .normalize();
    }
    const r = GLOBE_RADIUS * 1.012 + Math.sin(Math.PI * t) * this.lift;
    return optionalTarget.multiplyScalar(r);
  }
}

function sampleArcPoint(
  startDir: THREE.Vector3,
  endDir: THREE.Vector3,
  lift: number,
  t: number,
  out: THREE.Vector3
) {
  const dot = THREE.MathUtils.clamp(startDir.dot(endDir), -1, 1);
  const angle = Math.acos(dot);
  const sinA = Math.sin(angle);
  if (sinA < 1e-4) {
    out.copy(startDir);
  } else {
    const w0 = Math.sin((1 - t) * angle) / sinA;
    const w1 = Math.sin(t * angle) / sinA;
    out
      .set(0, 0, 0)
      .addScaledVector(startDir, w0)
      .addScaledVector(endDir, w1)
      .normalize();
  }
  const r = GLOBE_RADIUS * 1.028 + Math.sin(Math.PI * t) * lift;
  return out.multiplyScalar(r);
}

function createJetGlyphGeometry(): THREE.BufferGeometry {
  // Sleek low-poly chevron aircraft pointing +Z
  const vertices = new Float32Array([
    // Left wing upper
    0, 0.015, 0.14,  -0.11, 0, -0.09,  0, 0.025, -0.04,
    // Right wing upper
    0, 0.015, 0.14,   0, 0.025, -0.04,  0.11, 0, -0.09,
    // Left wing lower
    0, -0.01, 0.14,   0, 0.025, -0.04, -0.11, 0, -0.09,
    // Right wing lower
    0, -0.01, 0.14,   0.11, 0, -0.09,  0, 0.025, -0.04,
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

const GLOBE_VERT = /* glsl */ `
  attribute vec3 aNormal;
  attribute float aWeight;

  uniform vec3 uActiveDir;
  uniform float uHighlight;
  uniform float uDotScale;

  varying float vFront;
  varying float vRim;
  varying float vWeight;
  varying float vFocus;

  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vec3 vNorm = normalize(normalMatrix * aNormal);
    vec3 viewDir = normalize(-mvPos.xyz);

    float ndotv = dot(vNorm, viewDir);
    vFront = smoothstep(-0.22, 0.45, ndotv);
    vRim = pow(1.0 - max(ndotv, 0.0), 2.1);
    vWeight = aWeight;
    vFocus = pow(max(dot(normalize(aNormal), normalize(uActiveDir)), 0.0), 4.0) * uHighlight;

    float ptSize = mix(14.0, 25.0, aWeight) * uDotScale * (1.0 + vFocus * 0.45);
    gl_PointSize = clamp(ptSize / max(-mvPos.z, 1.0), 1.4, 7.5);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const GLOBE_FRAG = /* glsl */ `
  varying float vFront;
  varying float vRim;
  varying float vWeight;
  varying float vFocus;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    float alphaCircle = smoothstep(0.5, 0.12, dist);
    if (alphaCircle < 0.02) discard;

    vec3 baseOcean = vec3(0.18, 0.25, 0.42);
    vec3 baseLand = vec3(0.45, 0.72, 0.96);
    vec3 cyanGlow = vec3(0.0, 0.85, 1.0);
    vec3 violetRim = vec3(0.43, 0.36, 1.0);

    vec3 col = mix(baseOcean, baseLand, vWeight);
    col = mix(col, violetRim, vRim * 0.65);
    col = mix(col, cyanGlow, clamp(vFocus * 0.85, 0.0, 1.0));

    float alpha = alphaCircle * mix(0.08, 0.88, vFront) * mix(0.35, 1.0, vWeight);
    alpha = clamp(alpha + vFocus * 0.35 * alphaCircle, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`;

const ARC_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ARC_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uActive;
  uniform vec3 uColor;

  varying vec2 vUv;

  void main() {
    float head = fract(uTime * uSpeed);
    float dist = abs(vUv.x - head);
    float wrapDist = min(dist, 1.0 - dist);
    float pulse = smoothstep(0.18, 0.0, wrapDist);

    float baseAlpha = mix(0.22, 0.52, uActive);
    float alpha = clamp(baseAlpha + pulse * mix(0.55, 0.95, uActive), 0.0, 1.0);
    vec3 col = mix(uColor, vec3(1.0), pulse * 0.45);
    gl_FragColor = vec4(col, alpha);
  }
`;

function AviationNetworkContent() {
  const tier = useQualityTierContext();
  const isLite = tier === "lite";
  const { size, camera } = useThree();

  const globeGroupRef = useRef<THREE.Group>(null);
  const jetsRef = useRef<THREE.InstancedMesh>(null);
  const ringsRef = useRef<THREE.InstancedMesh>(null);
  const coresRef = useRef<THREE.InstancedMesh>(null);

  const smoothRotY = useRef(-HYD_NODE.lon * DEG2RAD);
  const smoothRotX = useRef(HYD_NODE.lat * DEG2RAD * 0.55);
  const dragInertiaX = useRef(0);
  const dragInertiaY = useRef(0);
  const userYaw = useRef(0);
  const userPitch = useRef(0);
  const lastTrackedDragX = useRef(0);
  const lastTrackedDragY = useRef(0);

  const scrollProgressRef = useOverlayScrollProgress(
    "scroll-container-aviation",
    "overlay-container-aviation"
  );

  // Scratch math objects (zero allocations inside useFrame)
  const scratch = useMemo(
    () => ({
      proj: new THREE.Vector3(),
      norm: new THREE.Vector3(),
      p0: new THREE.Vector3(),
      p1: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      mat: new THREE.Matrix4(),
      zAxis: new THREE.Vector3(0, 0, 1),
    }),
    []
  );

  const pickNodeAt = (clientX: number, clientY: number, maxRadiusPx: number): string | null => {
    const group = globeGroupRef.current;
    if (!group) return null;
    let bestCode: string | null = null;
    let bestDist = maxRadiusPx;

    for (let i = 0; i < AUTHORITY_NODES.length; i++) {
      const node = AUTHORITY_NODES[i];
      scratch.norm.copy(node.dir).transformDirection(group.matrixWorld);
      if (scratch.norm.z < -0.05) continue;

      scratch.proj.copy(node.pos).applyMatrix4(group.matrixWorld).project(camera);
      if (scratch.proj.z > 1) continue;

      const sx = (scratch.proj.x * 0.5 + 0.5) * size.width;
      const sy = (-scratch.proj.y * 0.5 + 0.5) * size.height;
      const dist = Math.hypot(sx - clientX, sy - clientY);
      if (dist < bestDist) {
        bestDist = dist;
        bestCode = node.code;
      }
    }
    return bestCode;
  };

  const pointerRef = useStagePointer("scroll-container-aviation", {
    onTap: (cx, cy) => {
      const hit = pickNodeAt(cx, cy, 48);
      if (hit) {
        const cur = aviationStore.get().selectedCode;
        aviationStore.set({
          selectedCode: cur === hit ? null : hit,
          hoveredCode: hit,
        });
      } else if (aviationStore.get().selectedCode) {
        aviationStore.set({ selectedCode: null });
      }
    },
  });

  // Fibonacci dot-sphere geometry & shader
  const dotCount = isLite ? 1200 : 3200;
  const dotsGeometry = useMemo(() => buildFibonacciDots(dotCount), [dotCount]);
  const dotsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GLOBE_VERT,
        fragmentShader: GLOBE_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uActiveDir: { value: AUTHORITY_NODES[0].dir.clone() },
          uHighlight: { value: 0.4 },
          uDotScale: { value: isLite ? 1.2 : 1.0 },
        },
      }),
    [isLite]
  );

  // Inner occlusion sphere, arcs, aircraft, rings, cores
  const coreOcclusionGeo = useMemo(
    () => new THREE.SphereGeometry(GLOBE_RADIUS * 0.975, isLite ? 20 : 32, isLite ? 16 : 24),
    [isLite]
  );
  const arcResources = useMemo(() => {
    const segments = isLite ? 28 : 56;
    return AUTHORITY_NODES.map((node, idx) => {
      const curve = new GreatCircleArcCurve(HYD_NODE.dir, node.dir, node.arcLift);
      const geo = new THREE.TubeGeometry(curve, segments, 0.016, 5, false);
      const mat = new THREE.ShaderMaterial({
        vertexShader: ARC_VERT,
        fragmentShader: ARC_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSpeed: { value: 0.28 + idx * 0.04 },
          uActive: { value: 0 },
          uColor: { value: new THREE.Color(node.color) },
        },
      });
      return { node, geo, mat };
    });
  }, [isLite]);

  const jetGeo = useMemo(() => createJetGlyphGeometry(), []);
  const jetMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#FFFFFF", toneMapped: false }),
    []
  );

  const ringGeo = useMemo(() => new THREE.RingGeometry(0.085, 0.135, isLite ? 16 : 24), [isLite]);
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FFFFFF",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        toneMapped: false,
      }),
    []
  );

  const nodeCoreGeo = useMemo(() => new THREE.SphereGeometry(0.052, 10, 10), []);
  const nodeCoreMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#FFFFFF", toneMapped: false }),
    []
  );

  // Set fixed instance colors once on mount
  useEffect(() => {
    if (jetsRef.current) {
      AUTHORITY_NODES.forEach((n, idx) => {
        jetsRef.current!.setColorAt(idx, new THREE.Color(n.color));
      });
      if (jetsRef.current.instanceColor) jetsRef.current.instanceColor.needsUpdate = true;
    }
    if (ringsRef.current && coresRef.current) {
      GEO_NODES.forEach((n, idx) => {
        const col = new THREE.Color(n.color);
        ringsRef.current!.setColorAt(idx, col);
        coresRef.current!.setColorAt(idx, col);
      });
      if (ringsRef.current.instanceColor) ringsRef.current.instanceColor.needsUpdate = true;
      if (coresRef.current.instanceColor) coresRef.current.instanceColor.needsUpdate = true;
    }
  }, [isLite]);

  // Clean GPU disposal on unmount / tier swap
  useEffect(() => {
    return () => {
      dotsGeometry.dispose();
      dotsMaterial.dispose();
    };
  }, [dotsGeometry, dotsMaterial]);

  useEffect(() => {
    return () => {
      coreOcclusionGeo.dispose();
      arcResources.forEach((a) => {
        a.geo.dispose();
        a.mat.dispose();
      });
    };
  }, [coreOcclusionGeo, arcResources]);

  useEffect(() => {
    return () => {
      jetGeo.dispose();
      jetMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      nodeCoreGeo.dispose();
      nodeCoreMat.dispose();
    };
  }, [jetGeo, jetMat, ringGeo, ringMat, nodeCoreGeo, nodeCoreMat]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.getElapsedTime();
    const group = globeGroupRef.current;
    if (!group) return;

    const pState = pointerRef.current;
    const syncState = aviationStore.get();
    const activeCode = syncState.domHoveredCode || syncState.selectedCode || syncState.hoveredCode;

    // Accumulate incremental pointer drag + exponential inertia
    const deltaDragX = pState.offsetX - lastTrackedDragX.current;
    const deltaDragY = pState.offsetY - lastTrackedDragY.current;
    lastTrackedDragX.current = pState.offsetX;
    lastTrackedDragY.current = pState.offsetY;

    if (pState.isDragging) {
      dragInertiaX.current = deltaDragX;
      dragInertiaY.current = deltaDragY;
    } else {
      dragInertiaX.current = THREE.MathUtils.damp(dragInertiaX.current, 0, 4.5, dt);
      dragInertiaY.current = THREE.MathUtils.damp(dragInertiaY.current, 0, 4.5, dt);
    }
    userYaw.current += dragInertiaX.current;
    userPitch.current = THREE.MathUtils.clamp(
      userPitch.current + dragInertiaY.current,
      -0.45,
      0.45
    );

    // Target orientation: India -> USA -> Europe via scroll, or direct focus when card/node hovered
    const sp = scrollProgressRef.current;
    let focusIndex = 0; // DGCA (India)
    if (sp >= 0.34 && sp < 0.7) focusIndex = 1; // FAA (USA)
    else if (sp >= 0.7) focusIndex = 2; // EASA (Europe)

    if (activeCode) {
      const matchIdx = AUTHORITY_NODES.findIndex((n) => n.code === activeCode);
      if (matchIdx !== -1) focusIndex = matchIdx;
    }

    const focusNode = AUTHORITY_NODES[focusIndex];
    const idleSpin = isReducedMotion() ? 0 : Math.sin(elapsed * 0.25) * 0.08;
    const targetRotY = -focusNode.lon * DEG2RAD + userYaw.current + idleSpin;
    const targetRotX = focusNode.lat * DEG2RAD * 0.55 + userPitch.current;

    smoothRotY.current = THREE.MathUtils.damp(smoothRotY.current, targetRotY, 4.2, dt);
    smoothRotX.current = THREE.MathUtils.damp(smoothRotX.current, targetRotX, 4.2, dt);

    group.rotation.y = smoothRotY.current;
    group.rotation.x = smoothRotX.current;
    group.updateMatrixWorld();

    // Update dot-sphere active direction highlight
    dotsMaterial.uniforms.uActiveDir.value.copy(focusNode.dir);
    dotsMaterial.uniforms.uHighlight.value = THREE.MathUtils.damp(
      dotsMaterial.uniforms.uHighlight.value,
      activeCode ? 1.0 : 0.45,
      5,
      dt
    );

    // Update arcs + aircraft glyphs
    for (let i = 0; i < arcResources.length; i++) {
      const arc = arcResources[i];
      const isFocused = activeCode ? arc.node.code === activeCode : i === focusIndex;
      arc.mat.uniforms.uTime.value = elapsed;
      arc.mat.uniforms.uActive.value = THREE.MathUtils.damp(
        arc.mat.uniforms.uActive.value,
        isFocused ? 1.0 : 0.0,
        6,
        dt
      );

      if (jetsRef.current) {
        const t = (elapsed * (0.14 + i * 0.025) + i * 0.31) % 1;
        const nextT = Math.min(0.999, t + 0.015);
        sampleArcPoint(HYD_NODE.dir, arc.node.dir, arc.node.arcLift, t, scratch.p0);
        sampleArcPoint(HYD_NODE.dir, arc.node.dir, arc.node.arcLift, nextT, scratch.p1);
        scratch.tangent.subVectors(scratch.p1, scratch.p0).normalize();
        scratch.up.copy(scratch.p0).normalize();
        scratch.right.crossVectors(scratch.up, scratch.tangent).normalize();
        scratch.up.crossVectors(scratch.tangent, scratch.right).normalize();
        scratch.mat.makeBasis(scratch.right, scratch.up, scratch.tangent);
        scratch.mat.setPosition(scratch.p0);
        const jetScale = isFocused ? 1.35 : 1.0;
        scratch.scale.set(jetScale, jetScale, jetScale);
        scratch.mat.scale(scratch.scale);
        jetsRef.current.setMatrixAt(i, scratch.mat);
      }
    }
    if (jetsRef.current) jetsRef.current.instanceMatrix.needsUpdate = true;

    // Update pulsing node rings & node cores (4 instances: HYD, DGCA, FAA, EASA)
    if (ringsRef.current && coresRef.current) {
      for (let i = 0; i < GEO_NODES.length; i++) {
        const node = GEO_NODES[i];
        const isHighlighted =
          activeCode === node.code || (!activeCode && node.code === focusNode.code);
        const pulse = 1 + Math.sin(elapsed * 3.4 + i * 1.3) * (isHighlighted ? 0.28 : 0.14);
        const ringScale = (isHighlighted ? 1.48 : 1.0) * pulse;

        scratch.quat.setFromUnitVectors(scratch.zAxis, node.dir);
        scratch.scale.set(ringScale, ringScale, ringScale);
        scratch.mat.compose(node.pos, scratch.quat, scratch.scale);
        ringsRef.current.setMatrixAt(i, scratch.mat);

        const coreScale = isHighlighted ? 1.45 : 1.0;
        scratch.scale.set(coreScale, coreScale, coreScale);
        scratch.mat.compose(node.pos, scratch.quat, scratch.scale);
        coresRef.current.setMatrixAt(i, scratch.mat);
      }
      ringsRef.current.instanceMatrix.needsUpdate = true;
      coresRef.current.instanceMatrix.needsUpdate = true;
    }

    // Hover picking by projecting the 3 authority anchor points
    if (pState.hasPointer && !pState.overDomControl && !pState.isDragging) {
      const hovered = pickNodeAt(pState.clientX, pState.clientY, 44);
      if (hovered !== syncState.hoveredCode) {
        aviationStore.set({ hoveredCode: hovered });
      }
    } else if (pState.overDomControl && syncState.hoveredCode !== null) {
      aviationStore.set({ hoveredCode: null });
    }

    // Reposition external DOM label chip directly via transform (0 React renders/frame)
    const chipCode = syncState.hoveredCode || syncState.selectedCode;
    const chipEl = document.getElementById("aviation-globe-chip");
    if (chipEl) {
      if (chipCode) {
        const targetNode = AUTHORITY_NODES.find((n) => n.code === chipCode);
        if (targetNode) {
          scratch.norm.copy(targetNode.dir).transformDirection(group.matrixWorld);
          if (scratch.norm.z > -0.15) {
            scratch.proj.copy(targetNode.pos).applyMatrix4(group.matrixWorld).project(camera);
            const sx = THREE.MathUtils.clamp(
              (scratch.proj.x * 0.5 + 0.5) * size.width,
              140,
              Math.max(150, size.width - 140)
            );
            const sy = THREE.MathUtils.clamp(
              (-scratch.proj.y * 0.5 + 0.5) * size.height - 18,
              76,
              Math.max(90, size.height - 96)
            );
            chipEl.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
          }
        }
      }
    }
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />

      <group ref={globeGroupRef} position={[0, -0.1, 0]}>
        {/* Occlusion core prevents cluttered back-hemisphere transparency */}
        <mesh geometry={coreOcclusionGeo}>
          <meshBasicMaterial color="#05060b" transparent opacity={0.88} />
        </mesh>

        {/* Dot-sphere globe (Fibonacci lattice + shader) */}
        <points geometry={dotsGeometry} material={dotsMaterial} />

        {/* Great-circle arcs from Hyderabad */}
        {arcResources.map((arc) => (
          <mesh key={arc.node.code} geometry={arc.geo} material={arc.mat} />
        ))}

        {/* Small aircraft glyphs travelling each arc */}
        <instancedMesh ref={jetsRef} args={[jetGeo, jetMat, AUTHORITY_NODES.length]} />

        {/* Pulsing rings + node cores */}
        <instancedMesh ref={ringsRef} args={[ringGeo, ringMat, GEO_NODES.length]} />
        <instancedMesh ref={coresRef} args={[nodeCoreGeo, nodeCoreMat, GEO_NODES.length]} />
      </group>

      {tier === "full" && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.9} intensity={1.35} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

export default function AviationScene({ triggerTime }: { triggerTime?: number | null }) {
  return (
    <SceneShell
      triggerTime={triggerTime}
      camera={{ position: [0, 0.25, 8.6], fov: 45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <AviationNetworkContent />
    </SceneShell>
  );
}
