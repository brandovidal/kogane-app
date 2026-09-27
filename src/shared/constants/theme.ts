export const THEME_PREFERENCE = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;
export const THEME_STORAGE_KEY = "theme";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";
export const THEME_OPTIONS = [
  { value: THEME_PREFERENCE.LIGHT, label: "Claro" },
  { value: THEME_PREFERENCE.DARK, label: "Oscuro" },
  { value: THEME_PREFERENCE.SYSTEM, label: "Sistema" },
];
