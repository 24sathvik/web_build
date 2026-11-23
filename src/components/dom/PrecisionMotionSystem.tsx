"use client";

import { useEffect } from "react";

/**
 * PrecisionMotionSystem (< 1 KB)
 * 1. Adds 'js' class to <html> so CSS scroll-reveal knows JavaScript is active.
 * 2. Single delegated pointermove listener for [data-spotlight] / .precision-card (rAF throttled).
 * 3. Shared IntersectionObserver fallback for browsers lacking CSS animation-timeline: view().
 */
export function PrecisionMotionSystem() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      root.classList.add("reduced-motion");
      return;
    }

    // 1. Delegated Pointer Spotlight (Fine pointer only)
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let spotlightCleanup: (() => void) | undefined;

    if (isFine) {
      let ticking = false;
      let activeCard: HTMLElement | null = null;
      let clientX = -999;
      let clientY = -999;

      const updateSpotlight = () => {
        if (activeCard) {
          const rect = activeCard.getBoundingClientRect();
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          activeCard.style.setProperty("--mouse-x", `${x.toFixed(1)}px`);
          activeCard.style.setProperty("--mouse-y", `${y.toFixed(1)}px`);
        }
        ticking = false;
      };

      const onPointerMove = (e: PointerEvent) => {
        const target = e.target as HTMLElement | null;
        const card = target ? (target.closest("[data-spotlight], .precision-card") as HTMLElement | null) : null;

        if (card) {
          activeCard = card;
          clientX = e.clientX;
          clientY = e.clientY;
          if (!ticking) {
            window.requestAnimationFrame(updateSpotlight);
            ticking = true;
          }
        } else if (activeCard) {
          activeCard.style.setProperty("--mouse-x", "-999px");
          activeCard.style.setProperty("--mouse-y", "-999px");
          activeCard = null;
        }
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      spotlightCleanup = () => window.removeEventListener("pointermove", onPointerMove);
    }

    // 2. Shared IntersectionObserver Fallback for Scroll Reveals
    const supportsViewTimeline = typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline", "view()");
    let observerCleanup: (() => void) | undefined;

    if (!supportsViewTimeline && typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
      );

      const elements = document.querySelectorAll(".reveal-on-scroll:not(.is-revealed)");
      elements.forEach((el) => observer.observe(el));

      observerCleanup = () => observer.disconnect();
    }

    return () => {
      if (spotlightCleanup) spotlightCleanup();
      if (observerCleanup) observerCleanup();
    };
  }, []);

  return null;
}
