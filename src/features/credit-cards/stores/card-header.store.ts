import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

interface CardHeaderState {
  count: number | null;
  title: string | null;
  setCount: (count: number | null) => void;
  setTitle: (title: string | null) => void;
}

export const cardHeaderStore = createStore<CardHeaderState>()((set) => ({
  count: null,
  title: null,
  setCount: (count) => set({ count }),
  setTitle: (title) => set({ title }),
}));

export const useCardHeader = <T>(selector: (state: CardHeaderState) => T) =>
  useStore(cardHeaderStore, selector);
