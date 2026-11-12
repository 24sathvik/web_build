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

export function CustomCursor() {
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

    let pointerX = -100;
    let pointerY = -100;
    let ringX = -100;
    let ringY = -100;
    let currentDotScale = 1;
    let currentRingScale = 1;
    let clickPulse = 0;
    let isPressed = false;
    let isVisible = false;
    let mode: CursorMode = "default";
    let magneticTarget: HTMLElement | null = null;
    let cachedRect: CachedRect | null = null;
    let rafId: number | null = null;
    let lastTime = 0;

    const updateElementAppearance = (nextMode: CursorMode) => {
      mode = nextMode;
      const hiddenOverNative = !isVisible || mode === "native";
      dotEl.style.opacity = hiddenOverNative ? "0" : "1";

      if (ringEl) {
        ringEl.style.opacity = hiddenOverNative || reducedMotion ? "0" : "1";
        if (mode === "interactive") {
          ringEl.style.borderColor = "rgba(0, 217, 255, 0.85)";
          ringEl.style.boxShadow = "0 0 18px rgba(0, 217, 255, 0.35)";
          ringEl.style.backgroundColor = "rgba(0, 217, 255, 0.08)";
        } else if (mode === "text") {
          ringEl.style.borderColor = "rgba(255, 255, 255, 0.45)";
          ringEl.style.boxShadow = "none";
          ringEl.style.backgroundColor = "transparent";
        } else {
          ringEl.style.borderColor = "rgba(0, 217, 255, 0.55)";
          ringEl.style.boxShadow = "none";
          ringEl.style.backgroundColor = "transparent";
        }
      }
    };

    const getTargetCoordinates = () => {
      if (mode === "interactive" && cachedRect && !reducedMotion) {
        const dx = cachedRect.centerX - pointerX;
        const dy = cachedRect.centerY - pointerY;
        const pullX = Math.max(-12, Math.min(12, dx * 0.28));
        const pullY = Math.max(-12, Math.min(12, dy * 0.28));
        return { x: pointerX + pullX, y: pointerY + pullY };
      }
      return { x: pointerX, y: pointerY };
    };

    const step = (now: number) => {
      if (document.hidden || !isVisible) {
        rafId = null;
        return;
      }

      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
      lastTime = now;

      const lerpFactor = 1 - Math.exp(-15 * dt);
      const { x: targetX, y: targetY } = getTargetCoordinates();

      ringX += (targetX - ringX) * lerpFactor;
      ringY += (targetY - ringY) * lerpFactor;

      if (!isPressed) {
        clickPulse *= Math.exp(-14 * dt);
        if (clickPulse < 0.005) clickPulse = 0;
      }

      const targetDotScale =
        mode === "text" ? 0.65 : mode === "interactive" ? 0.8 : isPressed ? 0.85 : 1;
      const baseRingScale =
        mode === "interactive" ? 1.55 : mode === "text" ? 0.55 : 1;
      const targetRingScale = Math.max(
        0.35,
        baseRingScale * (1 - clickPulse * 0.22)
      );

      currentDotScale += (targetDotScale - currentDotScale) * lerpFactor;
      currentRingScale += (targetRingScale - currentRingScale) * lerpFactor;

      dotEl.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%) scale(${currentDotScale.toFixed(3)})`;

      if (ringEl) {
        ringEl.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${currentRingScale.toFixed(3)})`;
      }

      const settled =
        Math.abs(targetX - ringX) < 0.08 &&
        Math.abs(targetY - ringY) < 0.08 &&
        Math.abs(targetDotScale - currentDotScale) < 0.005 &&
        Math.abs(targetRingScale - currentRingScale) < 0.005 &&
        clickPulse === 0 &&
        !isPressed;

      if (settled) {
        ringX = targetX;
        ringY = targetY;
        currentDotScale = targetDotScale;
        currentRingScale = targetRingScale;
        dotEl.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%) scale(${currentDotScale.toFixed(3)})`;
        if (ringEl) {
          ringEl.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${currentRingScale.toFixed(3)})`;
        }
        rafId = null;
        lastTime = 0;
        return;
      }

      rafId = window.requestAnimationFrame(step);
    };

    const scheduleFrame = () => {
      if (document.hidden || !isVisible) return;
      if (reducedMotion) {
        dotEl.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
        return;
      }
      if (rafId === null) {
        lastTime = 0;
        rafId = window.requestAnimationFrame(step);
      }
    };

    const resolveTargetMode = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        magneticTarget = null;
        cachedRect = null;
        updateElementAppearance("default");
        return;
      }

      if (target.closest(NATIVE_SELECTOR)) {
        magneticTarget = null;
        cachedRect = null;
        updateElementAppearance("native");
        return;
      }

      const interactiveEl = target.closest(INTERACTIVE_SELECTOR);
      if (interactiveEl instanceof HTMLElement) {
        const magEl = target.closest(MAGNETIC_SELECTOR);
        if (magEl instanceof HTMLElement) {
          if (magneticTarget !== magEl) {
            magneticTarget = magEl;
            const rect = magEl.getBoundingClientRect();
            cachedRect = {
              centerX: rect.left + rect.width / 2,
              centerY: rect.top + rect.height / 2,
            };
          }
        } else {
          magneticTarget = null;
          cachedRect = null;
        }
        updateElementAppearance("interactive");
        return;
      }

      magneticTarget = null;
      cachedRect = null;

      if (target.closest(TEXT_SELECTOR)) {
        updateElementAppearance("text");
        return;
      }

      updateElementAppearance("default");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") {
        return;
      }

      pointerX = e.clientX;
      pointerY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ringX = pointerX;
        ringY = pointerY;
        resolveTargetMode(e.target);
      }

      scheduleFrame();
    };

    const onPointerOver = (e: PointerEvent) => {
      resolveTargetMode(e.target);
      scheduleFrame();
    };

    const onPointerDown = (e: PointerEvent) => {
      resolveTargetMode(e.target);
      if (mode === "native" || reducedMotion) return;
      isPressed = true;
      clickPulse = 1;
      scheduleFrame();
    };

    const onPointerUp = () => {
      if (!isPressed) return;
      isPressed = false;
      scheduleFrame();
    };

    const onPointerLeaveWindow = () => {
      isVisible = false;
      magneticTarget = null;
      cachedRect = null;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      dotEl.style.opacity = "0";
      if (ringEl) ringEl.style.opacity = "0";
    };

    const onScrollOrResize = () => {
      // Refresh cached rect outside rAF if the hovered magnetic button scrolled
      if (magneticTarget && magneticTarget.isConnected) {
        const rect = magneticTarget.getBoundingClientRect();
        cachedRect = {
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
        };
      } else {
        magneticTarget = null;
        cachedRect = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
        lastTime = 0;
      } else if (isVisible) {
        scheduleFrame();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeaveWindow, {
      passive: true,
    });
    window.addEventListener("blur", onPointerLeaveWindow);
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    document.addEventListener("scroll", onScrollOrResize, {
      passive: true,
      capture: true,
    });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener(
        "mouseleave",
        onPointerLeaveWindow
      );
      window.removeEventListener("blur", onPointerLeaveWindow);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("scroll", onScrollOrResize, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, reducedMotion]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
    >
      {/* Center Dot */}
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-2 w-2 rounded-full bg-white opacity-0 will-change-transform"
        style={{ transition: "opacity 150ms ease-out" }}
      />

      {/* Lagging Outer Ring (omitted when prefers-reduced-motion: reduce) */}
      {!reducedMotion && (
        <div
          ref={ringRef}
          className="fixed left-0 top-0 h-9 w-9 rounded-full border border-[#00D9FF]/55 opacity-0 will-change-transform"
          style={{
            transition:
              "opacity 180ms ease-out, border-color 180ms ease-out, box-shadow 180ms ease-out, background-color 180ms ease-out",
          }}
        />
      )}
    </div>
  );
}
