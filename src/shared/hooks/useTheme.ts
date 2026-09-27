import { useStore } from "zustand";
import { themeStore, type ThemeState } from "@/shared/stores/theme.store";

export { themeStore } from "@/shared/stores/theme.store";

export function useThemeStore(): ThemeState;
export function useThemeStore<T>(selector: (state: ThemeState) => T): T;
export function useThemeStore<T>(selector?: (state: ThemeState) => T) {
  return useStore(themeStore, selector!);
}
