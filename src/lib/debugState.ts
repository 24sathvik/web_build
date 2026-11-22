// Typed lightweight state store for ?debug=1 HUD
type Listener = () => void;

export interface DebugTimeline {
  hydrationEnd: number | null;
  mountTrigger: number | null;
  chunkLoaded: number | null;
  firstFrame: number | null;
}

export interface DebugState {
  tier: string;
  dpr: number;
  mountedChapters: number;
  canvasMounted: boolean;
  longestLongTask: number;
  triggerToFirstFrame: number | null;
  drawCalls: number;
  timeline: DebugTimeline;
}

let state: DebugState = {
  tier: "static",
  dpr: 1,
  mountedChapters: 1,
  canvasMounted: false,
  longestLongTask: 0,
  triggerToFirstFrame: null,
  drawCalls: 0,
  timeline: {
    hydrationEnd: null,
    mountTrigger: null,
    chunkLoaded: null,
    firstFrame: null,
  },
};

const listeners = new Set<Listener>();

function syncGlobalTimeline() {
  if (typeof window === "undefined") return;
  const t = state.timeline;
  const hyd = t.hydrationEnd;
  (window as any).__ZYXEN_TIMELINE__ = {
    ...t,
    fromHydration: {
      mountTrigger: hyd !== null && t.mountTrigger !== null ? t.mountTrigger - hyd : null,
      chunkLoaded: hyd !== null && t.chunkLoaded !== null ? t.chunkLoaded - hyd : null,
      firstFrame: hyd !== null && t.firstFrame !== null ? t.firstFrame - hyd : null,
    },
    tier: state.tier,
    dpr: state.dpr,
    longestLongTask: state.longestLongTask,
  };
}

export const debugStore = {
  get: () => state,
  set: (partial: Partial<DebugState>) => {
    state = { ...state, ...partial };
    syncGlobalTimeline();
    listeners.forEach((l) => l());
  },
  setTimeline: (key: keyof DebugTimeline, time: number) => {
    if (state.timeline[key] !== null) return; // Keep earliest timestamp
    const rounded = Math.round(time);
    const updated = { ...state.timeline, [key]: rounded };
    state = { ...state, timeline: updated };
    syncGlobalTimeline();
    listeners.forEach((l) => l());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
