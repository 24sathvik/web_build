"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { debugStore } from "@/lib/debugState";

export function DebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [fps, setFps] = useState(0);
  const debugData = useSyncExternalStore(
    debugStore.subscribe,
    debugStore.get,
    () => debugStore.get()
  );

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("debug") === "1") {
        setEnabled(true);
      }
    } catch {}
  }, []);

  // PerformanceObserver for Longest Long Task
  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;

    let maxDuration = 0;
    let observer: PerformanceObserver | null = null;

    const handleEntries = (entries: PerformanceEntryList) => {
      for (const entry of entries) {
        if (entry.duration > maxDuration) {
          maxDuration = Math.round(entry.duration);
          debugStore.set({ longestLongTask: maxDuration });
        }
      }
    };

    try {
      observer = new PerformanceObserver((list) => {
        handleEntries(list.getEntries());
      });
      observer.observe({ type: "longtask", buffered: true });
    } catch {
      try {
        observer = new PerformanceObserver((list) => {
          handleEntries(list.getEntries());
        });
        observer.observe({ entryTypes: ["longtask"] });
      } catch {}
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      frameCount++;
      const elapsed = now - lastTime;
      if (elapsed >= 500) {
        setFps(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] bg-black/85 backdrop-blur-md border border-cyan-500/40 text-cyan-400 font-mono text-[11px] p-2.5 rounded-lg shadow-[0_0_15px_rgba(0,217,255,0.2)] pointer-events-none select-none flex flex-col gap-1 min-w-[145px]"
      aria-hidden="true"
    >
      <div className="text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10 pb-1 font-semibold">
        ZYXEN DEBUG
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-white/70">FPS:</span>
        <span className="font-bold text-emerald-400">{fps}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-white/70">Tier:</span>
        <span className="font-bold uppercase text-amber-400">{debugData.tier}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-white/70">DPR:</span>
        <span className="font-bold text-white">{debugData.dpr.toFixed(2)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-white/70">Chapters:</span>
        <span className="font-bold text-purple-400">{debugData.mountedChapters}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-white/70">Longest Task:</span>
        <span className="font-bold text-rose-400">{debugData.longestLongTask}ms</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-white/70">First Frame:</span>
        <span className="font-bold text-cyan-300">
          {debugData.triggerToFirstFrame !== null ? `${debugData.triggerToFirstFrame}ms` : "—"}
        </span>
      </div>
    </div>
  );
}

export default DebugOverlay;
