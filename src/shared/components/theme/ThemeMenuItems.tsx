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
      <DropdownMenuLabel className="px-2 pt-1 pb-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Apariencia
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup
        aria-label="Apariencia"
        className="mx-1 mb-1 grid grid-cols-3 gap-1 rounded-lg border bg-muted/40 p-1"
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
              className="min-h-8 justify-center gap-1.5 rounded-md px-2 text-xs data-[state=checked]:bg-accent data-[state=checked]:font-medium [&>span:first-child]:hidden"
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
