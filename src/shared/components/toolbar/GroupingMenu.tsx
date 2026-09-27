import { ChevronDown, Layers } from "lucide-react";
import { CountedToolbarButton } from "./CountedToolbarButton";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/ui/dropdown-menu";

export interface GroupingMenuProps<T extends string | readonly string[] = string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: string; label: string }[];
  multiple?: boolean;
}

export function GroupingMenu<T extends string | readonly string[]>({
  value,
  onChange,
  options,
  multiple = false,
}: GroupingMenuProps<T>) {
  const selected: string[] = Array.isArray(value)
    ? value.map(String)
    : value && value !== "none"
      ? [value as string]
      : [];
  const count = selected.length;
  const change = (next: string[]) => onChange((multiple ? next : next[0] ?? "none") as T);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CountedToolbarButton
          label="Agrupar"
          icon={<Layers className="h-4 w-4" />}
          count={count}
          trailingIcon={<ChevronDown className="h-3.5 w-3.5" />}
          variant={count > 0 ? "secondary" : "outline"}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuCheckboxItem
          checked={count === 0}
          onCheckedChange={() => change([])}
        >
          Sin agrupar
        </DropdownMenuCheckboxItem>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={(checked) =>
              change(checked
                ? multiple ? [...selected, option.value] : [option.value]
                : selected.filter((item) => item !== option.value))
            }
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
