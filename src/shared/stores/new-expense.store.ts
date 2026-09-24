import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { DraftFields } from "@/shared/api/hooks/drafts";

// Nuevo gasto (D79): one dialog for the whole app, opened from the menu or from each page with its destination
interface NewExpenseState {
  open: boolean;
  preset: Partial<DraftFields>;
  openWith: (preset?: Partial<DraftFields>) => void;
  close: () => void;
}

export const newExpenseStore = createStore<NewExpenseState>()((set) => ({
  open: false,
  preset: {},
  openWith: (preset = {}) => set({ open: true, preset }),
  close: () => set({ open: false }),
}));

export const useNewExpense = <T,>(selector: (state: NewExpenseState) => T) => useStore(newExpenseStore, selector);
