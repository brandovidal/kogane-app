import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { ViewMode } from "@/shared/types/data-view";

export interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (view: ViewMode) => void;
  className?: string;
  label?: string;
}

const VIEW_OPTIONS = [
  ["table", "Tabla", Table2],
  ["cards", "Tarjetas", LayoutGrid],
] as const satisfies readonly (readonly [ViewMode, string, typeof Table2])[];

export function ViewModeToggle({
  value,
  onChange,
  className,
  label = "Diseño",
}: ViewModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex items-center gap-0.5 rounded-sm border border-border/80 p-0.5",
        className,
      )}
    >
      {VIEW_OPTIONS.map(([mode, optionLabel, Icon]) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
            value === mode && "bg-accent text-foreground ring-1 ring-border/70",
          )}
        >
          <Icon className="size-4" />
          <span className="hidden sm:inline">{optionLabel}</span>
        </button>
      ))}
    </div>
  );
}
