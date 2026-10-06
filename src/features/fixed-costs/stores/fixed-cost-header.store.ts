import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

interface FixedCostHeaderState {
  shown: number | null;
  noun: "registro" | "pendiente" | "deuda";
  setShown: (shown: number | null, noun?: FixedCostHeaderState["noun"]) => void;
}

export const fixedCostHeaderStore = createStore<FixedCostHeaderState>()(
  (set) => ({
    shown: null,
    noun: "registro",
    setShown: (shown, noun = "registro") => set({ shown, noun }),
  }),
);

export const useFixedCostHeader = <T>(
  selector: (state: FixedCostHeaderState) => T,
) => useStore(fixedCostHeaderStore, selector);
