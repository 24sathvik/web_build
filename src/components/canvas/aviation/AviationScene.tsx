"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import SceneShell, { useQualityTierContext, useHasFirstFrame } from "../SceneShell";
import { useOverlayScrollProgress, useStagePointer } from "../useStagePointer";
import { aviationStore } from "@/lib/sceneSync";
import { isReducedMotion } from "@/lib/motion";

const GLOBE_BASE_RADIUS = 2.65;
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
    pos: dir.clone().multiplyScalar(GLOBE_BASE_RADIUS * 1.01),
  };
});

const HYD_NODE = GEO_NODES[0];
const AUTHORITY_NODES = GEO_NODES.filter((n) => n.isAuthority);

// 1. Fibonacci Dot-Sphere with Landmass Clustering
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

    // Harmonic landmass mask
    const lat = Math.asin(y);
    const lon = Math.atan2(x, z);
    const mask =
      Math.sin(lon * 2.3 + 0.5) * Math.cos(lat * 2.1 - 0.3) +
      0.55 * Math.cos(lon * 4.7 - lat * 3.1) +
      0.35 * Math.sin(lat * 5.2 + lon * 1.8);
    const weight = mask > 0.12 ? 1.0 : 0.32;

    positions[i * 3] = x * GLOBE_BASE_RADIUS;
    positions[i * 3 + 1] = y * GLOBE_BASE_RADIUS;
    positions[i * 3 + 2] = z * GLOBE_BASE_RADIUS;

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

// 2. Latitude / Longitude Graticule (Merged Single Draw Call)
function buildGraticuleGeometry(radius: number): THREE.BufferGeometry {
  const points: number[] = [];
  const segments = 64;

  // Parallels (Latitudes: -60, -30, 0, 30, 60)
  const latitudes = [-60, -30, 0, 30, 60];
  for (const lat of latitudes) {
    const phi = lat * DEG2RAD;
    const r = radius * Math.cos(phi);
    const y = radius * Math.sin(phi);
    for (let i = 0; i < segments; i++) {
      const theta1 = (i / segments) * Math.PI * 2;
      const theta2 = ((i + 1) / segments) * Math.PI * 2;
      points.push(
        r * Math.sin(theta1), y, r * Math.cos(theta1),
        r * Math.sin(theta2), y, r * Math.cos(theta2)
      );
    }
  }

  // Meridians (Longitudes: every 30 deg -> 12 meridians)
  for (let lon = 0; lon < 360; lon += 30) {
    const theta = lon * DEG2RAD;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    for (let i = 0; i < segments; i++) {
      const phi1 = -Math.PI / 2 + (i / segments) * Math.PI;
      const phi2 = -Math.PI / 2 + ((i + 1) / segments) * Math.PI;
      points.push(
        radius * Math.cos(phi1) * sinT, radius * Math.sin(phi1), radius * Math.cos(phi1) * cosT,
        radius * Math.cos(phi2) * sinT, radius * Math.sin(phi2), radius * Math.cos(phi2) * cosT
      );
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geo;
}

// 3. Parallax Starfield Background
function buildStarfieldGeometry(count: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color("#FFFFFF"),
    new THREE.Color("#00D9FF"),
    new THREE.Color("#6E5BFF"),
    new THREE.Color("#BFC7D5"),
  ];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 35 + Math.random() * 30; // Radius between 35 and 65
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = palette[i % palette.length];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

// 4. Orbital Navigation Ring
function buildOrbitRingGeometry(radius: number): THREE.BufferGeometry {
  const segments = 96;
  const points: number[] = [];
  for (let i = 0; i < segments; i++) {
    const t1 = (i / segments) * Math.PI * 2;
    const t2 = ((i + 1) / segments) * Math.PI * 2;
    points.push(
      radius * Math.cos(t1), 0, radius * Math.sin(t1),
      radius * Math.cos(t2), 0, radius * Math.sin(t2)
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geo;
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
    const r = GLOBE_BASE_RADIUS * 1.012 + Math.sin(Math.PI * t) * this.lift;
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
  const r = GLOBE_BASE_RADIUS * 1.028 + Math.sin(Math.PI * t) * lift;
  return out.multiplyScalar(r);
}

function createJetGlyphGeometry(): THREE.BufferGeometry {
  const vertices = new Float32Array([
    // Left wing upper
    0, 0.018, 0.16,  -0.13, 0, -0.10,  0, 0.03, -0.05,
    // Right wing upper
    0, 0.018, 0.16,   0, 0.03, -0.05,  0.13, 0, -0.10,
    // Left wing lower
    0, -0.012, 0.16,  0, 0.03, -0.05, -0.13, 0, -0.10,
    // Right wing lower
    0, -0.012, 0.16,  0.13, 0, -0.10,  0, 0.03, -0.05,
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

// Shaders
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
    vRim = pow(1.0 - max(ndotv, 0.0), 2.2);
    vWeight = aWeight;
    vFocus = pow(max(dot(normalize(aNormal), normalize(uActiveDir)), 0.0), 4.0) * uHighlight;

    float ptSize = mix(16.0, 28.0, aWeight) * uDotScale * (1.0 + vFocus * 0.5);
    gl_PointSize = clamp(ptSize / max(-mvPos.z, 1.0), 1.6, 8.5);
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

    vec3 baseOcean = vec3(0.18, 0.28, 0.46);
    vec3 baseLand = vec3(0.48, 0.78, 1.0);
    vec3 cyanGlow = vec3(0.0, 0.9, 1.0);
    vec3 violetRim = vec3(0.43, 0.36, 1.0);

    vec3 col = mix(baseOcean, baseLand, vWeight);
    col = mix(col, violetRim, vRim * 0.65);
    col = mix(col, cyanGlow, clamp(vFocus * 0.9, 0.0, 1.0));

    float alpha = alphaCircle * mix(0.1, 0.92, vFront) * mix(0.4, 1.0, vWeight);
    alpha = clamp(alpha + vFocus * 0.4 * alphaCircle, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`;

const FRESNEL_ATMOSPHERE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRESNEL_ATMOSPHERE_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float ndotv = max(dot(vNormal, vViewDir), 0.0);
    float fresnel = pow(1.0 - ndotv, 3.2);
    vec3 cyanGlow = vec3(0.0, 0.85, 1.0);
    vec3 violetGlow = vec3(0.43, 0.36, 1.0);
    vec3 col = mix(cyanGlow, violetGlow, 0.3);
    gl_FragColor = vec4(col, fresnel * 0.85);
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

    float baseAlpha = mix(0.24, 0.55, uActive);
    float alpha = clamp(baseAlpha + pulse * mix(0.6, 0.98, uActive), 0.0, 1.0);
    vec3 col = mix(uColor, vec3(1.0), pulse * 0.5);
    gl_FragColor = vec4(col, alpha);
  }
`;

function AviationNetworkContent() {
  const tier = useQualityTierContext();
  const hasFirstFrame = useHasFirstFrame();
  const isLite = tier === "lite";
  const { size, camera } = useThree();

  const globeGroupRef = useRef<THREE.Group>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);
  const starfieldRef = useRef<THREE.Points>(null);
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
      const hit = pickNodeAt(cx, cy, 54);
      if (hit) {
        const cur = aviationStore.get().selectedCode;
        aviationStore.set({
          selectedCode: cur === hit ? null : hit,
          hoveredCode: hit,
        });
      } else if (aviationStore.get().selectedCode) {
        aviationStore.set({ selectedCode: null, hoveredCode: null });
      }
    },
  });

  // Geometries and materials
  const dotCount = isLite ? 400 : 850;
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
          uHighlight: { value: 0.45 },
          uDotScale: { value: isLite ? 1.25 : 1.05 },
        },
      }),
    [isLite]
  );

  const fresnelAtmosphereGeo = useMemo(
    () => new THREE.SphereGeometry(GLOBE_BASE_RADIUS * 1.045, isLite ? 24 : 40, isLite ? 20 : 32),
    [isLite]
  );
  const fresnelAtmosphereMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: FRESNEL_ATMOSPHERE_VERT,
        fragmentShader: FRESNEL_ATMOSPHERE_FRAG,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    []
  );

  const graticuleGeo = useMemo(() => buildGraticuleGeometry(GLOBE_BASE_RADIUS * 1.003), []);
  const graticuleMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#00D9FF",
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const starfieldGeo = useMemo(() => buildStarfieldGeometry(isLite ? 250 : 600), [isLite]);
  const starfieldMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: isLite ? 0.8 : 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      }),
    [isLite]
  );

  const orbitRingGeo = useMemo(() => buildOrbitRingGeometry(GLOBE_BASE_RADIUS * 1.26), []);
  const orbitRingMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#6E5BFF",
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const coreOcclusionGeo = useMemo(
    () => new THREE.SphereGeometry(GLOBE_BASE_RADIUS * 0.978, isLite ? 24 : 36, isLite ? 18 : 28),
    [isLite]
  );

  const arcResources = useMemo(() => {
    const segments = isLite ? 32 : 64;
    return AUTHORITY_NODES.map((node, idx) => {
      const curve = new GreatCircleArcCurve(HYD_NODE.dir, node.dir, node.arcLift);
      const geo = new THREE.TubeGeometry(curve, segments, 0.018, 5, false);
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

  const ringGeo = useMemo(() => new THREE.RingGeometry(0.09, 0.145, isLite ? 16 : 24), [isLite]);
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

  const nodeCoreGeo = useMemo(() => new THREE.SphereGeometry(0.055, 12, 12), []);
  const nodeCoreMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#FFFFFF", toneMapped: false }),
    []
  );

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

  useEffect(() => {
    return () => {
      dotsGeometry.dispose();
      dotsMaterial.dispose();
      fresnelAtmosphereGeo.dispose();
      fresnelAtmosphereMat.dispose();
      graticuleGeo.dispose();
      graticuleMat.dispose();
      starfieldGeo.dispose();
      starfieldMat.dispose();
      orbitRingGeo.dispose();
      orbitRingMat.dispose();
      coreOcclusionGeo.dispose();
      arcResources.forEach((a) => {
        a.geo.dispose();
        a.mat.dispose();
      });
      jetGeo.dispose();
      jetMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      nodeCoreGeo.dispose();
      nodeCoreMat.dispose();
    };
  }, [
    dotsGeometry,
    dotsMaterial,
    fresnelAtmosphereGeo,
    fresnelAtmosphereMat,
    graticuleGeo,
    graticuleMat,
    starfieldGeo,
    starfieldMat,
    orbitRingGeo,
    orbitRingMat,
    coreOcclusionGeo,
    arcResources,
    jetGeo,
    jetMat,
    ringGeo,
    ringMat,
    nodeCoreGeo,
    nodeCoreMat,
  ]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.getElapsedTime();
    const group = globeGroupRef.current;
    if (!group) return;

    // Viewport frustum calculation
    const cam = camera as THREE.PerspectiveCamera;
    const dist = cam.position.z;
    const fovRad = (cam.fov * Math.PI) / 180;
    const vH = 2 * dist * Math.tan(fovRad / 2);
    const vW = vH * (size.width / size.height);
    const isMobile = size.width < 768;

    // Dynamic Sizing:
    // Desktop: globe spans 85% to 95% (target 90%) of viewport height
    // Phones: globe spans about 110% of viewport width, centered
    let targetScale = 1.0;
    let targetX = 0;
    let targetY = 0;

    if (isMobile) {
      const targetDiameter = 1.10 * vW;
      targetScale = targetDiameter / (2 * GLOBE_BASE_RADIUS);
      targetX = 0;
      targetY = -0.05 * vH;
    } else {
      const targetDiameter = 0.90 * vH;
      targetScale = targetDiameter / (2 * GLOBE_BASE_RADIUS);
      targetY = 0;
    }

    // Scroll progress section offset & camera story
    const sp = scrollProgressRef.current;
    const syncState = aviationStore.get();
    const activeCode = syncState.domHoveredCode || syncState.selectedCode || syncState.hoveredCode;

    let focusIndex = 0; // Default: DGCA (India)
    let zoomMultiplier = 1.0;

    if (!isMobile) {
      if (sp < 0.16) {
        // Hero: offset to right for text
        targetX = Math.min(0.24 * vW, 4.2);
        focusIndex = 0;
      } else if (sp < 0.36) {
        // Modules: shifted slightly to right
        targetX = Math.min(0.19 * vW, 3.4);
        focusIndex = 0;
      } else if (sp < 0.52) {
        // India Focus (DGCA)
        targetX = Math.min(0.25 * vW, 4.0);
        focusIndex = 0; // DGCA
      } else if (sp < 0.68) {
        // USA Focus (FAA)
        targetX = Math.min(0.22 * vW, 3.6);
        focusIndex = 1; // FAA
      } else if (sp < 0.82) {
        // Europe Focus (EASA)
        targetX = Math.min(0.26 * vW, 4.2);
        focusIndex = 2; // EASA
      } else {
        // Institutes / CTA: Centered & Zoom out
        targetX = 0;
        zoomMultiplier = 0.74; // Zoom out overview
        focusIndex = 0;
      }
    } else {
      // Mobile section focus
      if (sp >= 0.52 && sp < 0.68) focusIndex = 1;
      else if (sp >= 0.68 && sp < 0.82) focusIndex = 2;
      else if (sp >= 0.82) zoomMultiplier = 0.85;
    }

    // Direct authority selection / hover override
    if (activeCode) {
      const matchIdx = AUTHORITY_NODES.findIndex((n) => n.code === activeCode);
      if (matchIdx !== -1) focusIndex = matchIdx;
    }

    // Zoom fly-to when node selected
    if (syncState.selectedCode) {
      zoomMultiplier *= 1.25;
      if (!isMobile) targetX = Math.min(0.12 * vW, 2.2);
    }

    // Smooth position and scale damping
    group.position.x = THREE.MathUtils.damp(group.position.x, targetX, 3.8, dt);
    group.position.y = THREE.MathUtils.damp(group.position.y, targetY, 3.8, dt);
    const finalScale = targetScale * zoomMultiplier;
    group.scale.x = THREE.MathUtils.damp(group.scale.x, finalScale, 3.8, dt);
    group.scale.y = THREE.MathUtils.damp(group.scale.y, finalScale, 3.8, dt);
    group.scale.z = THREE.MathUtils.damp(group.scale.z, finalScale, 3.8, dt);

    // Pointer Drag & Inertia
    const pState = pointerRef.current;
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

    // Rotation target: focused node facing camera
    const focusNode = AUTHORITY_NODES[focusIndex];
    const idleSpin = isReducedMotion() ? 0 : Math.sin(elapsed * 0.2) * 0.06;
    const targetRotY = -focusNode.lon * DEG2RAD + userYaw.current + idleSpin;
    const targetRotX = focusNode.lat * DEG2RAD * 0.55 + userPitch.current;

    smoothRotY.current = THREE.MathUtils.damp(smoothRotY.current, targetRotY, 4.2, dt);
    smoothRotX.current = THREE.MathUtils.damp(smoothRotX.current, targetRotX, 4.2, dt);

    // Pointer parallax tilt
    const parallaxTiltX = pState.hasPointer ? pState.ndcY * 0.06 : 0;
    const parallaxTiltY = pState.hasPointer ? pState.ndcX * 0.08 : 0;

    group.rotation.y = smoothRotY.current + parallaxTiltY;
    group.rotation.x = smoothRotX.current + parallaxTiltX;
    group.updateMatrixWorld();

    // Starfield Parallax
    if (starfieldRef.current) {
      starfieldRef.current.rotation.y = elapsed * 0.015 + (pState.hasPointer ? pState.ndcX * 0.04 : 0);
      starfieldRef.current.rotation.x = pState.hasPointer ? -pState.ndcY * 0.03 : 0;
    }

    // Orbit Ring slow spin
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y = elapsed * 0.08;
    }

    // Update dot-sphere active highlight
    dotsMaterial.uniforms.uActiveDir.value.copy(focusNode.dir);
    dotsMaterial.uniforms.uHighlight.value = THREE.MathUtils.damp(
      dotsMaterial.uniforms.uHighlight.value,
      activeCode ? 1.0 : 0.45,
      5,
      dt
    );

    // Update Great-Circle Arcs and Aircraft Glyphs
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
        const jetScale = isFocused ? 1.45 : 1.05;
        scratch.scale.set(jetScale, jetScale, jetScale);
        scratch.mat.scale(scratch.scale);
        jetsRef.current.setMatrixAt(i, scratch.mat);
      }
    }
    if (jetsRef.current) jetsRef.current.instanceMatrix.needsUpdate = true;

    // Update Pulsing Node Rings & Cores
    if (ringsRef.current && coresRef.current) {
      for (let i = 0; i < GEO_NODES.length; i++) {
        const node = GEO_NODES[i];
        const isHighlighted =
          activeCode === node.code || (!activeCode && node.code === focusNode.code);
        const pulse = 1 + Math.sin(elapsed * 3.4 + i * 1.3) * (isHighlighted ? 0.32 : 0.16);
        const ringScale = (isHighlighted ? 1.55 : 1.0) * pulse;

        scratch.quat.setFromUnitVectors(scratch.zAxis, node.dir);
        scratch.scale.set(ringScale, ringScale, ringScale);
        scratch.mat.compose(node.pos, scratch.quat, scratch.scale);
        ringsRef.current.setMatrixAt(i, scratch.mat);

        const coreScale = isHighlighted ? 1.5 : 1.0;
        scratch.scale.set(coreScale, coreScale, coreScale);
        scratch.mat.compose(node.pos, scratch.quat, scratch.scale);
        coresRef.current.setMatrixAt(i, scratch.mat);
      }
      ringsRef.current.instanceMatrix.needsUpdate = true;
      coresRef.current.instanceMatrix.needsUpdate = true;
    }

    // Hover detection when pointer moves
    if (pState.hasPointer && !pState.overDomControl && !pState.isDragging) {
      const hovered = pickNodeAt(pState.clientX, pState.clientY, 48);
      if (hovered !== syncState.hoveredCode) {
        aviationStore.set({ hoveredCode: hovered });
      }
    } else if (pState.overDomControl && syncState.hoveredCode !== null) {
      aviationStore.set({ hoveredCode: null });
    }

    // Connect node to DOM label chip via SVG connecting line
    const chipCode = syncState.hoveredCode || syncState.selectedCode;
    const chipEl = document.getElementById("aviation-globe-chip");
    const lineSvg = document.getElementById("aviation-chip-svg");
    const lineEl = document.getElementById("aviation-chip-line");
    const dotEl = document.getElementById("aviation-chip-origin-dot");

    if (chipCode && chipEl) {
      const targetNode = AUTHORITY_NODES.find((n) => n.code === chipCode);
      if (targetNode) {
        scratch.norm.copy(targetNode.dir).transformDirection(group.matrixWorld);
        if (scratch.norm.z > -0.15) {
          scratch.proj.copy(targetNode.pos).applyMatrix4(group.matrixWorld).project(camera);
          const nodeScreenX = (scratch.proj.x * 0.5 + 0.5) * size.width;
          const nodeScreenY = (-scratch.proj.y * 0.5 + 0.5) * size.height;

          const isRightSide = nodeScreenX > size.width * 0.52;
          const chipX = isRightSide
            ? Math.max(20, nodeScreenX - 32)
            : Math.min(size.width - 20, nodeScreenX + 32);
          const chipY = THREE.MathUtils.clamp(
            nodeScreenY - 30,
            80,
            Math.max(90, size.height - 130)
          );
          const transformAnchor = isRightSide ? "-100%, -50%" : "0%, -50%";

          chipEl.style.transform = `translate3d(${chipX.toFixed(1)}px, ${chipY.toFixed(1)}px, 0) translate(${transformAnchor})`;

          if (lineSvg && lineEl && dotEl) {
            lineSvg.style.display = "block";
            lineEl.setAttribute("x1", nodeScreenX.toFixed(1));
            lineEl.setAttribute("y1", nodeScreenY.toFixed(1));
            lineEl.setAttribute("x2", chipX.toFixed(1));
            lineEl.setAttribute("y2", chipY.toFixed(1));
            dotEl.setAttribute("cx", nodeScreenX.toFixed(1));
            dotEl.setAttribute("cy", nodeScreenY.toFixed(1));
          }
        } else {
          if (lineSvg) lineSvg.style.display = "none";
        }
      }
    } else {
      if (lineSvg) lineSvg.style.display = "none";
    }

    if (typeof window !== "undefined") {
      (window as any).__ZYXEN_AVIATION_CALLS__ = state.gl.info.render.calls;
    }
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />

      {/* 1. Deep Parallax Starfield */}
      <points ref={starfieldRef} geometry={starfieldGeo} material={starfieldMat} />

      {/* 2. Main Responsive Globe Group */}
      <group ref={globeGroupRef} position={[0, 0, 0]}>
        {/* Occlusion core prevents cluttered back-hemisphere transparency */}
        <mesh geometry={coreOcclusionGeo}>
          <meshBasicMaterial color="#05060d" transparent opacity={0.92} />
        </mesh>

        {/* Faint latitude / longitude graticule */}
        <lineSegments geometry={graticuleGeo} material={graticuleMat} />

        {/* Dot-sphere globe (Fibonacci lattice + landmass clustering) */}
        <points geometry={dotsGeometry} material={dotsMaterial} />

        {/* Fresnel atmosphere rim glow */}
        <mesh geometry={fresnelAtmosphereGeo} material={fresnelAtmosphereMat} />

        {/* Great-circle arcs from Hyderabad */}
        {hasFirstFrame &&
          arcResources.map((arc) => (
            <mesh key={arc.node.code} geometry={arc.geo} material={arc.mat} />
          ))}

        {/* Travelling aircraft glyphs */}
        {hasFirstFrame && (
          <instancedMesh ref={jetsRef} args={[jetGeo, jetMat, AUTHORITY_NODES.length]} />
        )}

        {/* Pulsing rings + node cores */}
        <instancedMesh ref={ringsRef} args={[ringGeo, ringMat, GEO_NODES.length]} />
        <instancedMesh ref={coresRef} args={[nodeCoreGeo, nodeCoreMat, GEO_NODES.length]} />

        {/* Tilted orbital ring */}
        <group ref={orbitGroupRef} rotation={[0.42, 0.28, 0]}>
          <lineSegments geometry={orbitRingGeo} material={orbitRingMat} />
        </group>
      </group>

      {/* Postprocessing (Full tier only; <= 30 draw calls total) */}
      {tier === "full" && hasFirstFrame && (
        <EffectComposer multisampling={0} resolutionScale={0.65}>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={1.4} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

export default function AviationScene({ triggerTime }: { triggerTime?: number | null } = {}) {
  return (
    <SceneShell
      triggerTime={triggerTime}
      camera={{ position: [0, 0, 8.8], fov: 45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <AviationNetworkContent />
    </SceneShell>
  );
}
