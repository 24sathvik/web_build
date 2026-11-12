"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import SceneShell, { useQualityTierContext } from "../SceneShell";
import { useOverlayScrollProgress, useStagePointer } from "../useStagePointer";
import { siteContent, type ProjectItem } from "@/content/site";
import { projectStore } from "@/lib/sceneSync";
import { isReducedMotion } from "@/lib/motion";

const PROJECTS = siteContent.projects;
const PANEL_COUNT = PROJECTS.length;
const CYLINDER_RADIUS = 5.6;
const ANGLE_STEP = (Math.PI * 2) / PANEL_COUNT;

const ATLAS_COLS = 2;
const ATLAS_ROWS = 5;

function getProjectAccent(project: ProjectItem): string {
  if (project.id === "raise-lab-equipment") return "#00FFB2";
  return project.group === "aviation" ? "#00D9FF" : "#6E5BFF";
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function createProjectAtlasTexture(size: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#06070d";
    ctx.fillRect(0, 0, size, size);

    const cellW = size / ATLAS_COLS;
    const cellH = size / ATLAS_ROWS;
    const pad = Math.max(4, Math.round(size * 0.012));

    PROJECTS.forEach((project, idx) => {
      const col = idx % ATLAS_COLS;
      const row = Math.floor(idx / ATLAS_COLS);
      const x = col * cellW + pad;
      const y = row * cellH + pad;
      const w = cellW - pad * 2;
      const h = cellH - pad * 2;
      const accent = getProjectAccent(project);
      const isRaiseLab = project.id === "raise-lab-equipment";

      // Card background fill
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, isRaiseLab ? "rgba(0, 46, 36, 0.94)" : "rgba(15, 19, 32, 0.94)");
      grad.addColorStop(1, "rgba(7, 9, 16, 0.96)");
      drawRoundedRect(ctx, x, y, w, h, Math.max(6, w * 0.04));
      ctx.fillStyle = grad;
      ctx.fill();

      // Border + top accent stripe
      ctx.lineWidth = Math.max(1.5, size * 0.0024);
      ctx.strokeStyle = isRaiseLab ? "rgba(0, 255, 178, 0.78)" : `${accent}88`;
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.fillRect(x + w * 0.06, y + h * 0.09, w * 0.28, Math.max(2, h * 0.025));

      // Badge pill
      const badgeFontSize = Math.max(7, Math.round(h * 0.105));
      ctx.font = `700 ${badgeFontSize}px monospace`;
      const badgeText = project.badge.toUpperCase();
      ctx.fillStyle = accent;
      ctx.fillText(badgeText, x + w * 0.06, y + h * 0.27);

      // Project name (wrap into up to 2 lines cleanly)
      const titleFontSize = Math.max(10, Math.round(h * 0.165));
      ctx.font = `700 ${titleFontSize}px sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      const maxTextW = w * 0.88;
      const words = project.name.split(" ");
      let line1 = "";
      let line2 = "";
      for (const word of words) {
        const test = line1 ? `${line1} ${word}` : word;
        if (ctx.measureText(test).width <= maxTextW) {
          line1 = test;
        } else {
          line2 = line2 ? `${line2} ${word}` : word;
        }
      }
      ctx.fillText(line1, x + w * 0.06, y + h * 0.54, maxTextW);
      if (line2) {
        ctx.fillText(line2, x + w * 0.06, y + h * 0.72, maxTextW);
      }

      // Feature summary line
      const featFontSize = Math.max(6, Math.round(h * 0.09));
      ctx.font = `500 ${featFontSize}px monospace`;
      ctx.fillStyle = "rgba(191, 199, 213, 0.75)";
      const featText = project.features.slice(0, 2).join("  •  ");
      ctx.fillText(featText, x + w * 0.06, y + h * 0.9, maxTextW);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = size >= 1024 ? 4 : 1;
  texture.needsUpdate = true;
  return texture;
}

function createPanelGeometry(index: number): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(2.45, 1.12, 1, 1);
  const col = index % ATLAS_COLS;
  const row = Math.floor(index / ATLAS_COLS);

  // Canvas Y=0 is top; WebGL texture V=1 is top
  const u0 = col / ATLAS_COLS;
  const u1 = (col + 1) / ATLAS_COLS;
  const vTop = 1 - row / ATLAS_ROWS;
  const vBottom = 1 - (row + 1) / ATLAS_ROWS;

  const uv = geo.attributes.uv;
  // PlaneGeometry default vertex order: top-left, top-right, bottom-left, bottom-right
  uv.setXY(0, u0, vTop);
  uv.setXY(1, u1, vTop);
  uv.setXY(2, u0, vBottom);
  uv.setXY(3, u1, vBottom);
  uv.needsUpdate = true;
  return geo;
}

const FLOOR_VERT = /* glsl */ `
  varying vec2 vWorldXz;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldXz = wp.xz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FLOOR_FRAG = /* glsl */ `
  uniform vec3 uAccentColor;
  uniform float uShowReflection;

  varying vec2 vWorldXz;
  varying vec2 vUv;

  void main() {
    vec2 grid = abs(fract(vWorldXz * 0.65 - 0.5) - 0.5) / max(fwidth(vWorldXz * 0.65), vec2(0.001));
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);

    float radialDist = length(vWorldXz) / 14.0;
    float edgeFade = 1.0 - smoothstep(0.25, 1.0, radialDist);

    // Full tier adds a subtle glowing floor reflection pool beneath the front-facing panel
    float frontDist = length(vWorldXz - vec2(0.0, 5.1));
    float reflectionGlow = uShowReflection * exp(-frontDist * frontDist * 0.14) * 0.28;

    vec3 col = mix(vec3(0.08, 0.13, 0.22), uAccentColor, 0.35) * line;
    col += uAccentColor * reflectionGlow;

    float alpha = clamp(line * 0.28 * edgeFade + reflectionGlow * edgeFade, 0.0, 0.85);
    gl_FragColor = vec4(col, alpha);
  }
`;

function scrollToProjectCard(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: isReducedMotion() ? "auto" : "smooth",
    block: "center",
  });
}

function ProjectsOrbitContent() {
  const tier = useQualityTierContext();
  const isLite = tier === "lite";
  const { size, camera } = useThree();

  const orbitGroupRef = useRef<THREE.Group>(null);
  const panelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const floorRef = useRef<THREE.Mesh>(null);

  const smoothOrbitAngle = useRef(0);
  const smoothTiltX = useRef(0);
  const smoothTiltY = useRef(0);
  const dragAngle = useRef(0);
  const dragInertia = useRef(0);
  const lastDragX = useRef(0);
  const lastReportedActive = useRef<string | null>(null);
  const lastFocusNonce = useRef(0);

  const scrollProgressRef = useOverlayScrollProgress(
    "scroll-container-projects",
    "overlay-container-projects"
  );

  const scratch = useMemo(
    () => ({
      worldPos: new THREE.Vector3(),
      proj: new THREE.Vector3(),
      accentColor: new THREE.Color(),
    }),
    []
  );

  // Single CanvasTexture atlas (512px on Lite, 2048px on Full)
  const atlasSize = isLite ? 512 : 2048;
  const atlasTexture = useMemo(() => createProjectAtlasTexture(atlasSize), [atlasSize]);

  // Pre-mapped geometries + materials per panel (Lite: MeshBasicMaterial, Full: MeshStandardMaterial)
  const panelResources = useMemo(() => {
    return PROJECTS.map((project, idx) => {
      const geo = createPanelGeometry(idx);
      const isRaiseLab = project.id === "raise-lab-equipment";
      const accent = getProjectAccent(project);
      const mat = isLite
        ? new THREE.MeshBasicMaterial({
            map: atlasTexture,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
          })
        : new THREE.MeshStandardMaterial({
            map: atlasTexture,
            transparent: true,
            opacity: 0.92,
            roughness: isRaiseLab ? 0.25 : 0.38,
            metalness: 0.15,
            emissive: new THREE.Color(accent),
            emissiveIntensity: isRaiseLab ? 0.18 : 0.08,
            side: THREE.DoubleSide,
          });
      return { project, geo, mat, accent };
    });
  }, [atlasTexture, isLite]);

  const floorGeo = useMemo(() => new THREE.PlaneGeometry(34, 34, 1, 1), []);
  const floorMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: FLOOR_VERT,
        fragmentShader: FLOOR_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uAccentColor: { value: new THREE.Color("#00D9FF") },
          uShowReflection: { value: isLite ? 0.0 : 1.0 },
        },
      }),
    [isLite]
  );

  // Sync reflection uniform live if downgraded full -> lite
  useEffect(() => {
    floorMat.uniforms.uShowReflection.value = isLite ? 0.0 : 1.0;
  }, [floorMat, isLite]);

  // GPU cleanup on unmount / tier change
  useEffect(() => {
    return () => {
      atlasTexture.dispose();
    };
  }, [atlasTexture]);

  useEffect(() => {
    return () => {
      panelResources.forEach((p) => {
        p.geo.dispose();
        p.mat.dispose();
      });
    };
  }, [panelResources]);

  useEffect(() => {
    return () => {
      floorGeo.dispose();
      floorMat.dispose();
    };
  }, [floorGeo, floorMat]);

  const pickPanelAt = (clientX: number, clientY: number, maxRadiusPx: number): string | null => {
    let bestId: string | null = null;
    let bestDist = maxRadiusPx;

    for (let i = 0; i < panelRefs.current.length; i++) {
      const mesh = panelRefs.current[i];
      if (!mesh) continue;

      mesh.getWorldPosition(scratch.worldPos);
      // Only pick panels reasonably in front of the cylinder center
      if (scratch.worldPos.z < 1.0) continue;

      scratch.proj.copy(scratch.worldPos).project(camera);
      if (scratch.proj.z > 1) continue;

      const sx = (scratch.proj.x * 0.5 + 0.5) * size.width;
      const sy = (-scratch.proj.y * 0.5 + 0.5) * size.height;
      const dist = Math.hypot(sx - clientX, sy - clientY);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = PROJECTS[i].id;
      }
    }
    return bestId;
  };

  const pointerRef = useStagePointer("scroll-container-projects", {
    onTap: (cx, cy) => {
      const hitId = pickPanelAt(cx, cy, 110);
      if (hitId) {
        const nextNonce = projectStore.get().focusNonce + 1;
        projectStore.set({
          activeId: hitId,
          hoveredId: hitId,
          focusNonce: nextNonce,
        });
        scrollToProjectCard(hitId);
      }
    },
    sensitivityX: 0.0055,
  });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const group = orbitGroupRef.current;
    if (!group) return;

    const pState = pointerRef.current;
    const syncState = projectStore.get();

    // Drag inertia
    const deltaX = pState.offsetX - lastDragX.current;
    lastDragX.current = pState.offsetX;
    if (pState.isDragging) {
      dragInertia.current = deltaX;
    } else {
      dragInertia.current = THREE.MathUtils.damp(dragInertia.current, 0, 5.0, dt);
    }
    dragAngle.current += dragInertia.current;

    // When DOM card explicitly focused/clicked, snap drag offset cleanly toward that project angle
    if (syncState.focusNonce !== lastFocusNonce.current) {
      lastFocusNonce.current = syncState.focusNonce;
      dragAngle.current = 0;
    }

    // Target cylinder angle: map scroll progress through projects, or turn directly to hovered/selected DOM project
    const focusedId = syncState.domHoveredId || syncState.activeId;
    const focusedIdx = focusedId ? PROJECTS.findIndex((p) => p.id === focusedId) : -1;

    let baseTargetAngle = scrollProgressRef.current * (ANGLE_STEP * (PANEL_COUNT - 1));
    if (focusedIdx >= 0 && (syncState.domHoveredId || !pState.isDragging)) {
      if (syncState.domHoveredId) {
        baseTargetAngle = focusedIdx * ANGLE_STEP;
        dragAngle.current = THREE.MathUtils.damp(dragAngle.current, 0, 6.0, dt);
      }
    }

    const targetAngle = -(baseTargetAngle) + dragAngle.current;
    smoothOrbitAngle.current = THREE.MathUtils.damp(smoothOrbitAngle.current, targetAngle, 5.2, dt);

    // Gentle pointer tilt
    const targetTiltX = isReducedMotion() ? 0 : pState.ndcY * 0.07;
    const targetTiltY = isReducedMotion() ? 0 : pState.ndcX * 0.09;
    smoothTiltX.current = THREE.MathUtils.damp(smoothTiltX.current, targetTiltX, 5.0, dt);
    smoothTiltY.current = THREE.MathUtils.damp(smoothTiltY.current, targetTiltY, 5.0, dt);

    group.rotation.y = smoothOrbitAngle.current + smoothTiltY.current;
    group.rotation.x = smoothTiltX.current;
    group.updateMatrixWorld();

    // Determine closest front-facing panel & update per-panel scale + depth fade
    let frontId: string | null = null;
    let maxZ = -Infinity;

    for (let i = 0; i < panelResources.length; i++) {
      const mesh = panelRefs.current[i];
      if (!mesh) continue;

      const baseTheta = i * ANGLE_STEP;
      const worldAngle = baseTheta + group.rotation.y;
      const frontness = Math.cos(worldAngle); // +1 facing camera, -1 back

      const isHovered =
        syncState.hoveredId === PROJECTS[i].id || syncState.domHoveredId === PROJECTS[i].id;
      const targetScale =
        frontness > 0
          ? 0.92 + 0.32 * Math.pow(frontness, 1.7) + (isHovered ? 0.08 : 0)
          : 0.78 + 0.14 * (frontness + 1);
      const dampedScale = THREE.MathUtils.damp(mesh.scale.x, targetScale, 7.0, dt);
      mesh.scale.set(dampedScale, dampedScale, dampedScale);

      const targetOpacity =
        frontness > 0
          ? 0.34 + 0.48 * Math.pow(frontness, 1.3)
          : 0.12 + 0.22 * Math.max(0, frontness + 1);
      panelResources[i].mat.opacity = THREE.MathUtils.damp(
        panelResources[i].mat.opacity,
        isHovered ? 0.96 : targetOpacity,
        7.0,
        dt
      );

      mesh.getWorldPosition(scratch.worldPos);
      if (scratch.worldPos.z > maxZ) {
        maxZ = scratch.worldPos.z;
        frontId = PROJECTS[i].id;
      }
    }

    if (frontId && frontId !== lastReportedActive.current) {
      lastReportedActive.current = frontId;
      const matched = PROJECTS.find((p) => p.id === frontId);
      if (matched) {
        scratch.accentColor.set(getProjectAccent(matched));
        floorMat.uniforms.uAccentColor.value.copy(scratch.accentColor);
      }
    }

    // Hover picking on front panels
    if (pState.hasPointer && !pState.overDomControl && !pState.isDragging) {
      const hovered = pickPanelAt(pState.clientX, pState.clientY, 100);
      if (hovered !== syncState.hoveredId) {
        projectStore.set({ hoveredId: hovered });
      }
    } else if (pState.overDomControl && syncState.hoveredId !== null) {
      projectStore.set({ hoveredId: null });
    }
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />

      {!isLite && (
        <>
          <ambientLight intensity={1.3} />
          <directionalLight position={[4, 6, 8]} intensity={1.4} color="#FFFFFF" />
        </>
      )}

      {/* Cylinder gallery of 10 project panels */}
      <group ref={orbitGroupRef} position={[0, -0.32, -1.6]} scale={size.width < 640 ? 0.78 : 1}>
        {panelResources.map((item, idx) => {
          const theta = idx * ANGLE_STEP;
          const x = Math.sin(theta) * CYLINDER_RADIUS;
          const z = Math.cos(theta) * CYLINDER_RADIUS;
          return (
            <mesh
              key={item.project.id}
              ref={(el) => {
                panelRefs.current[idx] = el;
              }}
              position={[x, 0, z]}
              rotation={[0, theta, 0]}
              geometry={item.geo}
              material={item.mat}
            />
          );
        })}
      </group>

      {/* Subtle coordinate floor grid */}
      <mesh
        ref={floorRef}
        position={[0, -2.35, -1.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={floorGeo}
        material={floorMat}
      />

      {tier === "full" && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.45} luminanceSmoothing={0.85} intensity={1.0} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

export default function ProjectsScene({
  triggerTime,
}: {
  triggerTime?: number | null;
}) {
  return (
    <SceneShell
      triggerTime={triggerTime}
      camera={{ position: [0, 0.55, 10.6], fov: 45 }}
      gl={{ powerPreference: "high-performance", antialias: false }}
    >
      <ProjectsOrbitContent />
    </SceneShell>
  );
}
