import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

interface PlatformHeaderState {
  count: number | null;
  setCount: (count: number | null) => void;
}

export const platformHeaderStore = createStore<PlatformHeaderState>()((set) => ({
  count: null,
  setCount: (count) => set({ count }),
}));

export const usePlatformHeader = <T,>(selector: (state: PlatformHeaderState) => T) =>
  useStore(platformHeaderStore, selector);
