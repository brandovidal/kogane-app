import { createStore } from "zustand/vanilla";
import {
  THEME_PREFERENCE,
  THEME_STORAGE_KEY,
  THEME_MEDIA_QUERY,
} from "@/shared/constants/theme";
import type { ThemePreference, ResolvedTheme } from "@/shared/types/theme";

export interface ThemeState {
  theme: ResolvedTheme;
  preference: ThemePreference;
  initTheme: () => void;
  setTheme: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function resolvedTheme(preference: ThemePreference): ResolvedTheme {
  return preference === THEME_PREFERENCE.SYSTEM
    ? window.matchMedia(THEME_MEDIA_QUERY).matches
      ? THEME_PREFERENCE.DARK
      : THEME_PREFERENCE.LIGHT
    : preference;
}

let listening = false;

export const themeStore = createStore<ThemeState>()((set, get) => ({
  theme: "light",
  preference: THEME_PREFERENCE.SYSTEM,
  initTheme: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const preference =
      stored === THEME_PREFERENCE.LIGHT || stored === THEME_PREFERENCE.DARK
        ? stored
        : THEME_PREFERENCE.SYSTEM;
    const theme = resolvedTheme(preference);
    set({ theme, preference });
    applyTheme(theme);
    if (!listening) {
      listening = true;
      window.matchMedia(THEME_MEDIA_QUERY).addEventListener("change", () => {
        if (get().preference !== THEME_PREFERENCE.SYSTEM) return;
        const theme = resolvedTheme(THEME_PREFERENCE.SYSTEM);
        set({ theme });
        applyTheme(theme);
      });
    }
  },
  setTheme: (preference) => {
    const theme = resolvedTheme(preference);
    set({ theme, preference });
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    applyTheme(theme);
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));
