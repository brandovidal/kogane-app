import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

// The header lives in its own Astro island; the list publishes how many records it shows (D56).
interface FixedCostHeaderState {
  shown: number | null;
  setShown: (shown: number | null) => void;
}

export const fixedCostHeaderStore = createStore<FixedCostHeaderState>()((set) => ({
  shown: null,
  setShown: (shown) => set({ shown }),
}));

export const useFixedCostHeader = <T,>(selector: (state: FixedCostHeaderState) => T) =>
  useStore(fixedCostHeaderStore, selector);
