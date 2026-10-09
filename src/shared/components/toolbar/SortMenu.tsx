import type { ReactElement } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

export interface SortMenuProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: readonly { value: string; label: string }[];
  trigger: ReactElement;
  originalLabel?: string;
  label?: string;
  align?: "start" | "center" | "end";
  className?: string;
}

const ORIGINAL_ORDER = "__original__";

export function SortMenu({
  value,
  onChange,
  options,
  trigger,
  originalLabel = "Orden original",
  label = "Ordenar por",
  align = "start",
  className = "w-60",
}: SortMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value ?? ORIGINAL_ORDER}
          onValueChange={(next) =>
            onChange(next === ORIGINAL_ORDER ? undefined : next)
          }
        >
          <DropdownMenuRadioItem value={ORIGINAL_ORDER}>
            {originalLabel}
          </DropdownMenuRadioItem>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
