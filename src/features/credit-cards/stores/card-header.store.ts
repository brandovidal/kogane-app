import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

interface CardHeaderState {
  count: number | null;
  setCount: (count: number | null) => void;
}

export const cardHeaderStore = createStore<CardHeaderState>()((set) => ({
  count: null,
  setCount: (count) => set({ count }),
}));

export const useCardHeader = <T>(selector: (state: CardHeaderState) => T) =>
  useStore(cardHeaderStore, selector);
