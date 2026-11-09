// Typed lightweight state store for ?debug=1 HUD
type Listener = () => void;

export interface DebugState {
  tier: string;
  dpr: number;
  mountedChapters: number;
  canvasMounted: boolean;
}

let state: DebugState = {
  tier: "static",
  dpr: 1,
  mountedChapters: 1,
  canvasMounted: false,
};

const listeners = new Set<Listener>();

export const debugStore = {
  get: () => state,
  set: (partial: Partial<DebugState>) => {
    state = { ...state, ...partial };
    listeners.forEach((l) => l());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

