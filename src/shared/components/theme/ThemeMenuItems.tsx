import { useEffect } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/shared/hooks/useTheme";
import { THEME_OPTIONS, THEME_PREFERENCE } from "@/shared/constants/theme";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/ui/dropdown-menu";

const ICONS = { light: Sun, dark: Moon, system: Monitor };

export function ThemeMenuItems() {
  const preference = useThemeStore((state) => state.preference);
  const setTheme = useThemeStore((state) => state.setTheme);
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
        Apariencia
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup
        aria-label="Apariencia"
        value={preference}
        onValueChange={(value) => {
          if (
            value === THEME_PREFERENCE.LIGHT ||
            value === THEME_PREFERENCE.DARK ||
            value === THEME_PREFERENCE.SYSTEM
          )
            setTheme(value);
        }}
      >
        {THEME_OPTIONS.map((option) => {
          const Icon = ICONS[option.value];
          return (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="min-h-9 gap-2"
            >
              <Icon aria-hidden="true" className="size-4" />
              {option.label}
            </DropdownMenuRadioItem>
          );
        })}
      </DropdownMenuRadioGroup>
    </>
  );
}
