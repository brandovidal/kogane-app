import type { THEME_PREFERENCE } from "@/shared/constants/theme";

export type ThemePreference =
  (typeof THEME_PREFERENCE)[keyof typeof THEME_PREFERENCE];
export type ResolvedTheme = Exclude<ThemePreference, "system">;
