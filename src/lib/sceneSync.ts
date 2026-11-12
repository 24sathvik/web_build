"use client";

import { useSyncExternalStore } from "react";

export interface SelectionStore<T> {
  get: () => T;
  set: (partial: Partial<T>) => void;
  subscribe: (listener: () => void) => () => void;
}

/** Tiny zero-dependency store shared between DOM overlays and R3F scenes. */
export function createSelectionStore<T extends object>(initial: T): SelectionStore<T> {
  let state = { ...initial };
  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set: (partial: Partial<T>) => {
      let changed = false;
      for (const k of Object.keys(partial) as (keyof T)[]) {
        if (state[k] !== partial[k]) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...partial };
      listeners.forEach((fn) => fn());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useSelectionStore<T>(store: SelectionStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export interface AviationSelectionState {
  hoveredCode: string | null;
  selectedCode: string | null;
  domHoveredCode: string | null;
}

export const aviationStore = createSelectionStore<AviationSelectionState>({
  hoveredCode: null,
  selectedCode: null,
  domHoveredCode: null,
});

export interface ProjectSelectionState {
  hoveredId: string | null;
  activeId: string | null;
  domHoveredId: string | null;
  /** Incrementing request counter when DOM requests rotating directly to a project. */
  focusNonce: number;
}

export const projectStore = createSelectionStore<ProjectSelectionState>({
  hoveredId: null,
  activeId: null,
  domHoveredId: null,
  focusNonce: 0,
});

export interface BlogSelectionState {
  hoveredSlug: string | null;
  hoveredCategory: string | null;
  domHoveredSlug: string | null;
  domHoveredCategory: string | null;
}

export const blogStore = createSelectionStore<BlogSelectionState>({
  hoveredSlug: null,
  hoveredCategory: null,
  domHoveredSlug: null,
  domHoveredCategory: null,
});

