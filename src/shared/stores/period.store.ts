import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import { getCurrentMonth, getCurrentYear } from "@/shared/lib/dates";

// The month shown by the active view (D56: zustand only for the interface; the data comes from kogane-api)
interface PeriodState {
  month: number;
  year: number;
  setPeriod: (month: number, year: number) => void;
  navigate: (delta: number) => void;
}

export const periodStore = createStore<PeriodState>()((set) => ({
  month: getCurrentMonth(),
  year: getCurrentYear(),
  setPeriod: (month, year) => set({ month, year }),
  navigate: (delta) =>
    set(({ month, year }) => {
      const index = year * 12 + (month - 1) + delta;
      return { month: (index % 12) + 1, year: Math.floor(index / 12) };
    }),
}));

export const usePeriod = <T,>(selector: (state: PeriodState) => T) => useStore(periodStore, selector);
