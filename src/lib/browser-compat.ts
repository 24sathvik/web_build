/**
 * Cross-browser compatibility helpers for Safari, iOS, and older Android browsers.
 * Provides safe fallbacks for scheduler.postTask, requestIdleCallback,
 * navigator.connection, and navigator.deviceMemory.
 */

// 1. requestIdleCallback fallback (Safari / iOS / older WebViews)
export function safeRequestIdleCallback(
  callback: (deadline?: { didTimeout: boolean; timeRemaining: () => number }) => void,
  options?: { timeout?: number }
): number {
  if (typeof window !== "undefined" && typeof (window as any).requestIdleCallback === "function") {
    return (window as any).requestIdleCallback(callback, options);
  }
  const timeout = Math.min(options?.timeout || 50, 100);
  const start = Date.now();
  return (setTimeout as unknown as (fn: () => void, ms?: number) => number)(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, timeout);
}

export function safeCancelIdleCallback(handle: number): void {
  if (typeof window !== "undefined" && typeof (window as any).cancelIdleCallback === "function") {
    (window as any).cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}

// 2. scheduler.postTask fallback (Safari / WebKit / Firefox without postTask)
export function safePostTask<T = void>(
  task: () => T | Promise<T>,
  options?: { priority?: "user-blocking" | "user-visible" | "background" }
): Promise<T> {
  if (
    typeof window !== "undefined" &&
    "scheduler" in window &&
    typeof (window as any).scheduler?.postTask === "function"
  ) {
    return (window as any).scheduler.postTask(task, options);
  }

  return new Promise<T>((resolve, reject) => {
    const run = () => {
      try {
        resolve(task());
      } catch (err) {
        reject(err);
      }
    };

    if (options?.priority === "user-blocking") {
      run();
    } else if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => run());
    } else {
      setTimeout(run, 0);
    }
  });
}

// 3. navigator.connection fallback (Safari / iOS returns undefined)
export interface NetworkInformationCompat {
  saveData: boolean;
  effectiveType: "slow-2g" | "2g" | "3g" | "4g";
}

export function getNetworkConnection(): NetworkInformationCompat {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const conn = (navigator as any).connection;
    if (conn) {
      return {
        saveData: conn.saveData === true,
        effectiveType: conn.effectiveType || "4g",
      };
    }
  }
  return {
    saveData: false,
    effectiveType: "4g",
  };
}

// 4. navigator.deviceMemory fallback (Safari / iOS does not expose deviceMemory)
export function getDeviceMemoryGB(): number {
  if (
    typeof navigator !== "undefined" &&
    "deviceMemory" in navigator &&
    typeof (navigator as any).deviceMemory === "number"
  ) {
    return (navigator as any).deviceMemory;
  }

  // Fallback heuristics based on hardware concurrency or viewport
  if (typeof navigator !== "undefined" && typeof navigator.hardwareConcurrency === "number") {
    if (navigator.hardwareConcurrency <= 2) return 2;
    if (navigator.hardwareConcurrency <= 4) return 4;
    return 8;
  }
  return 4;
}

