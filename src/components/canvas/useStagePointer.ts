"use client";

import { useEffect, useRef } from "react";

export interface StagePointerState {
  clientX: number;
  clientY: number;
  ndcX: number;
  ndcY: number;
  hasPointer: boolean;
  /** True while cursor sits over an interactive DOM element (link, button, card input, nav, footer). */
  overDomControl: boolean;
  isDragging: boolean;
  /** Accumulated horizontal and vertical drag rotation offsets (updated synchronously by events). */
  offsetX: number;
  offsetY: number;
  /** Instantaneous angular velocity in X/Y so scenes can apply inertia after release. */
  velX: number;
  velY: number;
}

const DOM_CONTROL_SELECTOR =
  'a, button, input, select, textarea, [role="button"], [data-dom-interactive="true"], header, nav, footer';

/**
 * Shared pointer + horizontal-touch drag hook for full-bleed canvases layered beneath scroll containers.
 * Vertical touch gestures pass straight through via `touch-action: pan-y`.
 */
export function useStagePointer(
  scrollContainerId: string,
  options?: {
    onTap?: (clientX: number, clientY: number, ndcX: number, ndcY: number) => void;
    sensitivityX?: number;
    sensitivityY?: number;
  }
) {
  const sensitivityX = options?.sensitivityX ?? 0.0065;
  const sensitivityY = options?.sensitivityY ?? 0.0045;
  const onTapRef = useRef(options?.onTap);

  useEffect(() => {
    onTapRef.current = options?.onTap;
  }, [options?.onTap]);

  const stateRef = useRef<StagePointerState>({
    clientX: 0,
    clientY: 0,
    ndcX: 0,
    ndcY: 0,
    hasPointer: false,
    overDomControl: false,
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
    velX: 0,
    velY: 0,
  });

  useEffect(() => {
    const scrollEl = document.getElementById(scrollContainerId);
    let pointerDown = false;
    let activePointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let prevX = 0;
    let prevY = 0;
    let startTime = 0;
    let movedDist = 0;
    let dragAxis: "x" | "y" | null = null;
    let downWasDomControl = false;

    const isDomInteractive = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest(DOM_CONTROL_SELECTOR));

    const updateNdc = (clientX: number, clientY: number) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const s = stateRef.current;
      s.clientX = clientX;
      s.clientY = clientY;
      s.ndcX = (clientX / w) * 2 - 1;
      s.ndcY = -(clientY / h) * 2 + 1;
      s.hasPointer = true;
    };

    const onPointerDown = (e: PointerEvent) => {
      downWasDomControl = isDomInteractive(e.target);
      updateNdc(e.clientX, e.clientY);
      stateRef.current.overDomControl = downWasDomControl;
      if (downWasDomControl) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      pointerDown = true;
      activePointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      prevX = e.clientX;
      prevY = e.clientY;
      startTime = performance.now();
      movedDist = 0;
      dragAxis = e.pointerType === "touch" ? null : "x";
      stateRef.current.velX = 0;
      stateRef.current.velY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      updateNdc(e.clientX, e.clientY);
      stateRef.current.overDomControl = isDomInteractive(e.target);

      if (!pointerDown || e.pointerId !== activePointerId) return;

      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      movedDist += Math.hypot(dx, dy);

      if (e.pointerType === "touch" && dragAxis === null) {
        const totalX = Math.abs(e.clientX - startX);
        const totalY = Math.abs(e.clientY - startY);
        if (Math.hypot(totalX, totalY) > 8) {
          dragAxis = totalX > totalY * 1.15 ? "x" : "y";
        }
      }

      if (dragAxis === "x") {
        stateRef.current.isDragging = true;
        const deltaX = dx * sensitivityX;
        const deltaY = e.pointerType === "touch" ? 0 : dy * sensitivityY;
        stateRef.current.offsetX += deltaX;
        stateRef.current.offsetY += deltaY;
        stateRef.current.velX = deltaX;
        stateRef.current.velY = deltaY;
      }
    };

    const endDrag = (e: PointerEvent, allowTap: boolean) => {
      if (e.pointerId !== activePointerId && activePointerId !== null) return;
      const elapsed = performance.now() - startTime;
      const wasTap =
        allowTap &&
        pointerDown &&
        !downWasDomControl &&
        movedDist < 10 &&
        elapsed < 400;

      pointerDown = false;
      activePointerId = null;
      stateRef.current.isDragging = false;
      dragAxis = null;

      if (wasTap && onTapRef.current) {
        updateNdc(e.clientX, e.clientY);
        onTapRef.current(
          stateRef.current.clientX,
          stateRef.current.clientY,
          stateRef.current.ndcX,
          stateRef.current.ndcY
        );
      }
    };

    const onPointerUp = (e: PointerEvent) => endDrag(e, true);
    const onPointerCancel = (e: PointerEvent) => endDrag(e, false);

    const targetEl: EventTarget = scrollEl ?? window;
    targetEl.addEventListener("pointerdown", onPointerDown as EventListener, {
      passive: true,
    });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerCancel, { passive: true });

    return () => {
      targetEl.removeEventListener("pointerdown", onPointerDown as EventListener);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [scrollContainerId, sensitivityX, sensitivityY]);

  return stateRef;
}

/**
 * Passive scroll-progress ref measured from the overlay container height (unaffected by footer height).
 * Performs zero DOM reads inside R3F's useFrame.
 */
export function useOverlayScrollProgress(scrollContainerId: string, overlayContainerId: string) {
  const progressRef = useRef(0);

  useEffect(() => {
    const scrollEl = document.getElementById(scrollContainerId);
    if (!scrollEl) return;

    const update = () => {
      const overlayEl = document.getElementById(overlayContainerId);
      const height = overlayEl ? overlayEl.offsetHeight : scrollEl.scrollHeight;
      const maxScroll = height - scrollEl.clientHeight;
      if (maxScroll <= 0) {
        progressRef.current = 0;
        return;
      }
      progressRef.current = Math.min(1, Math.max(0, scrollEl.scrollTop / maxScroll));
    };

    update();
    scrollEl.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      scrollEl.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollContainerId, overlayContainerId]);

  return progressRef;
}
