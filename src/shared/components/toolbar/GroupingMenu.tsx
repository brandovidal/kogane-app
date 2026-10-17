import type { ReactElement } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { CountedToolbarButton } from "./CountedToolbarButton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

export interface GroupingMenuProps<T extends string | readonly string[] = string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: string; label: string }[];
  multiple?: boolean;
  ordered?: boolean;
  maxSelected?: number;
  floatingCount?: boolean;
  trigger?: ReactElement;
  align?: "start" | "center" | "end";
  className?: string;
  /** "Ocultar grupos vacíos": shown only while a grouping is active */
  hideEmpty?: { checked: boolean; onChange: (checked: boolean) => void };
}

export function GroupingMenu<T extends string | readonly string[]>({
  value,
  onChange,
  options,
  multiple = false,
  ordered = false,
  maxSelected,
  floatingCount = false,
  trigger,
  align = "end",
  className = "w-48",
  hideEmpty,
}: GroupingMenuProps<T>) {
  const selected: string[] = Array.isArray(value) ? value.map(String) : value && value !== "none" ? [value as string] : [];
  const count = selected.length;
  const change = (next: string[]) => onChange((multiple ? next : (next[0] ?? "none")) as T);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <CountedToolbarButton
            label="Agrupar"
            icon={<Layers className="h-4 w-4" />}
            count={count}
            trailingIcon={<ChevronDown className="h-3.5 w-3.5" />}
            variant={count > 0 ? "secondary" : "outline"}
            floatingCount={floatingCount}
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        {ordered && <DropdownMenuLabel>Agrupar por (en orden)</DropdownMenuLabel>}
        <DropdownMenuCheckboxItem
          checked={count === 0}
          onSelect={multiple || ordered ? (event) => event.preventDefault() : undefined}
          onCheckedChange={() => change([])}
        >
          Sin agrupar
        </DropdownMenuCheckboxItem>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onSelect={multiple || ordered ? (event) => event.preventDefault() : undefined}
            onCheckedChange={(checked) =>
              change(
                checked
                  ? multiple
                    ? maxSelected && selected.length >= maxSelected
                      ? selected
                      : [...selected, option.value]
                    : [option.value]
                  : selected.filter((item) => item !== option.value),
              )
            }
          >
            {option.label}
            {ordered && selected.includes(option.value) && count > 1 && (
              <span className="ml-auto text-xs text-muted-foreground">{selected.indexOf(option.value) + 1}°</span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
        {hideEmpty && count > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={hideEmpty.checked} onSelect={(event) => event.preventDefault()} onCheckedChange={hideEmpty.onChange}>
              Ocultar grupos vacíos
            </DropdownMenuCheckboxItem>
          </>
        )}
        {multiple && maxSelected && maxSelected > 1 && options.length > 1 && (
          <p className="px-2 pt-1.5 pb-1 text-xs text-muted-foreground">
            Puedes combinar hasta {maxSelected} niveles, por ejemplo{" "}
            {options
              .slice(0, 2)
              .map((option) => option.label.replace(/^Por /, ""))
              .join(" › ")}
            .
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
