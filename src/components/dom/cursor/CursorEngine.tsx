"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

type CursorMode = "default" | "interactive" | "text" | "native";

interface CachedRect {
  centerX: number;
  centerY: number;
}

const NATIVE_SELECTOR =
  'input, select, textarea, option, [contenteditable="true"], [contenteditable=""]';
const INTERACTIVE_SELECTOR = 'a, button, [role="button"]';
const MAGNETIC_SELECTOR = 'button, [role="button"]';
const TEXT_SELECTOR =
  "p, h1, h2, h3, h4, h5, h6, blockquote, li, code, pre, label, strong, em";

function useMediaMatch(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false
  );
}

export function CursorEngine() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  const isFinePointer = useMediaMatch("(pointer: fine)");
  const reducedMotion = useMediaMatch("(prefers-reduced-motion: reduce)");
  const enabled = isFinePointer && !isAdmin;

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const dotEl = dotRef.current;
    const ringEl = ringRef.current;
    if (!dotEl) return;

    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let ringScale = 1;
    let currentMode: CursorMode = "default";
    let isVisible = false;
    let isClicking = false;
    let magneticTarget: HTMLElement | null = null;
    let magneticRect: CachedRect | null = null;
    let magneticTransformCleanups: Array<() => void> = [];

    let isObserving = false;
    let isIntersecting = true;
    let intersectionObserver: IntersectionObserver | null = null;

    let rafId: number | null = null;
    let lastTime = 0;
    let running = true;

    const applyDotTransform = (x: number, y: number, scale = 1) => {
      dotEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
    };

    const applyRingTransform = (x: number, y: number, scale = 1) => {
      if (!ringEl) return;
      ringEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
    };

    const updateVisibility = () => {
      const show = isVisible && isIntersecting;
      const opacity = show ? "1" : "0";
      dotEl.style.opacity = opacity;
      if (ringEl) ringEl.style.opacity = opacity;
    };

    const updateModeClasses = (next: CursorMode) => {
      if (next === currentMode) return;
      currentMode = next;
      const ring = ringEl;

      dotEl.classList.toggle("zy-cursor-dot--native", next === "native");
      dotEl.classList.toggle("zy-cursor-dot--interactive", next === "interactive");
      dotEl.classList.toggle("zy-cursor-dot--text", next === "text");

      if (ring) {
        ring.classList.toggle("zy-cursor-ring--native", next === "native");
        ring.classList.toggle("zy-cursor-ring--interactive", next === "interactive");
        ring.classList.toggle("zy-cursor-ring--text", next === "text");
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ringX = targetX;
        ringY = targetY;
        applyDotTransform(targetX, targetY);
        applyRingTransform(ringX, ringY, ringScale);
        updateVisibility();
      }

      const target = e.target as Element | null;
      if (!target) return;

      if (target.closest(NATIVE_SELECTOR)) {
        updateModeClasses("native");
        magneticTarget = null;
        magneticRect = null;
        return;
      }

      const interactiveEl = target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
      if (interactiveEl) {
        updateModeClasses("interactive");

        if (interactiveEl.matches(MAGNETIC_SELECTOR) && !reducedMotion) {
          if (magneticTarget !== interactiveEl) {
            magneticTarget = interactiveEl;
            const r = interactiveEl.getBoundingClientRect();
            magneticRect = {
              centerX: r.left + r.width / 2,
              centerY: r.top + r.height / 2,
            };
          }
        } else {
          magneticTarget = null;
          magneticRect = null;
        }
        return;
      }

      if (target.closest(TEXT_SELECTOR)) {
        updateModeClasses("text");
        magneticTarget = null;
        magneticRect = null;
        return;
      }

      updateModeClasses("default");
      magneticTarget = null;
      magneticRect = null;
    };

    const handlePointerDown = () => {
      isClicking = true;
    };

    const handlePointerUp = () => {
      isClicking = false;
    };

    const handlePointerEnter = () => {
      isVisible = true;
      updateVisibility();
    };

    const handlePointerLeave = () => {
      isVisible = false;
      updateVisibility();
    };

    const loop = (time: number) => {
      if (!running) return;

      if (lastTime === 0) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      let desiredX = targetX;
      let desiredY = targetY;

      if (magneticTarget && magneticRect && !reducedMotion) {
        const dx = targetX - magneticRect.centerX;
        const dy = targetY - magneticRect.centerY;
        const distSq = dx * dx + dy * dy;
        const maxDist = 80;
        if (distSq < maxDist * maxDist) {
          const strength = 0.28;
          desiredX = targetX - dx * strength;
          desiredY = targetY - dy * strength;

          const btnDx = dx * 0.18;
          const btnDy = dy * 0.18;
          magneticTarget.style.transform = `translate3d(${btnDx.toFixed(2)}px, ${btnDy.toFixed(2)}px, 0)`;

          const elToClean = magneticTarget;
          if (!magneticTransformCleanups.some((fn) => (fn as unknown as { el: HTMLElement }).el === elToClean)) {
            const cleanup = () => {
              elToClean.style.transform = "";
            };
            (cleanup as unknown as { el: HTMLElement }).el = elToClean;
            magneticTransformCleanups.push(cleanup);
          }
        } else {
          magneticTarget = null;
          magneticRect = null;
        }
      }

      applyDotTransform(targetX, targetY, isClicking ? 0.75 : 1);

      if (ringEl) {
        if (reducedMotion) {
          ringX = desiredX;
          ringY = desiredY;
        } else {
          const factor = 1 - Math.exp(-18 * dt);
          ringX += (desiredX - ringX) * factor;
          ringY += (desiredY - ringY) * factor;
        }

        let targetScale = 1;
        if (currentMode === "interactive") targetScale = 1.45;
        else if (currentMode === "text") targetScale = 0.55;
        else if (currentMode === "native") targetScale = 0.2;

        if (isClicking) targetScale *= 0.85;

        if (reducedMotion) {
          ringScale = targetScale;
        } else {
          const scaleFactor = 1 - Math.exp(-22 * dt);
          ringScale += (targetScale - ringScale) * scaleFactor;
        }

        applyRingTransform(ringX, ringY, ringScale);
      }

      if (magneticTransformCleanups.length > 0 && !magneticTarget) {
        magneticTransformCleanups.forEach((fn) => fn());
        magneticTransformCleanups = [];
      }

      rafId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.documentElement.addEventListener("pointerenter", handlePointerEnter, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isIntersecting = entry ? entry.isIntersecting : true;
          updateVisibility();
        },
        { threshold: 0 }
      );
      intersectionObserver.observe(dotEl);
      isObserving = true;
    }

    rafId = window.requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.documentElement.removeEventListener("pointerenter", handlePointerEnter);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      if (isObserving && intersectionObserver) {
        intersectionObserver.disconnect();
      }
      magneticTransformCleanups.forEach((fn) => fn());
    };
  }, [enabled, reducedMotion]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2.5 w-2.5 rounded-full bg-[#00D9FF] opacity-0 will-change-transform shadow-[0_0_8px_rgba(0,217,255,0.7)]"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          transition: "opacity 160ms ease-out, background-color 200ms ease",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-9 w-9 rounded-full border border-white/40 opacity-0 will-change-transform backdrop-blur-[1px]"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          transition: "opacity 200ms ease-out, border-color 200ms ease, background-color 200ms ease",
        }}
      />
    </>
  );
}
