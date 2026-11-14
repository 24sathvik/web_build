"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/analytics";

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [loadGA, setLoadGA] = useState(false);

  // Web Vitals telemetry (CLS, FID/INP, LCP, FCP, TTFB)
  useReportWebVitals((metric) => {
    if (!gaId) return;

    // GA4 recommends reporting CLS multiplied by 1000 or as float delta
    const val =
      metric.name === "CLS"
        ? Math.round(metric.value * 1000)
        : Math.round(metric.value);

    trackEvent(metric.name, {
      value: val,
      event_label: metric.id,
      metric_id: metric.id,
      metric_value: metric.value,
      metric_rating: metric.rating,
      non_interaction: true,
    });
  });

  useEffect(() => {
    if (!gaId) return;

    let loaded = false;
    const triggerLoad = () => {
      if (loaded) return;
      loaded = true;
      setLoadGA(true);
      cleanupInteractionListeners();
    };

    const interactionEvents = ["pointerdown", "scroll", "keydown", "touchstart"];
    const onUserInteraction = () => triggerLoad();

    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, onUserInteraction, { once: true, passive: true });
    });

    let idleId: number | undefined;
    let timerId: NodeJS.Timeout | undefined;

    type IdleWindow = typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleWin = window as IdleWindow;

    if (typeof idleWin.requestIdleCallback === "function") {
      idleId = idleWin.requestIdleCallback(triggerLoad, { timeout: 4000 });
    } else {
      timerId = setTimeout(triggerLoad, 3500);
    }

    const cleanupInteractionListeners = () => {
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, onUserInteraction);
      });
      if (idleId && typeof idleWin.cancelIdleCallback === "function") {
        idleWin.cancelIdleCallback(idleId);
      }
      if (timerId) {
        clearTimeout(timerId);
      }
    };

    // Global delegation for phone_click, email_click, and main_cta_click
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const telLink = target.closest<HTMLAnchorElement>('a[href^="tel:"]');
      if (telLink) {
        const phone = telLink.getAttribute("href")?.replace(/^tel:/, "") || "";
        trackEvent("phone_click", { phone_number: phone });
        return;
      }

      const mailLink = target.closest<HTMLAnchorElement>('a[href^="mailto:"]');
      if (mailLink) {
        const email = mailLink.getAttribute("href")?.replace(/^mailto:/, "") || "";
        trackEvent("email_click", { email_address: email });
        return;
      }

      const ctaEl = target.closest<HTMLElement>(
        '[data-cta], a[href="/contact"], button[type="submit"], .cta-button'
      );
      if (ctaEl) {
        const label =
          ctaEl.getAttribute("data-cta") ||
          ctaEl.textContent?.trim().slice(0, 50) ||
          "cta_click";
        trackEvent("main_cta_click", {
          cta_label: label,
          cta_target: ctaEl.getAttribute("href") || "action",
        });
      }
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      cleanupInteractionListeners();
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [gaId]);

  if (!gaId || !loadGA) {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}
