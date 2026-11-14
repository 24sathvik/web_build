export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return;

  try {
    // If gtag is available on window
    const win = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };

    if (typeof win.gtag === "function") {
      win.gtag("event", eventName, params);
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  } catch {
    // Fail silently without blocking UI
  }
}
