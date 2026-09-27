import { ChevronDown, Layers } from "lucide-react";
import { CountedToolbarButton } from "./CountedToolbarButton";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/ui/dropdown-menu";

export interface GroupingMenuProps {
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function GroupingMenu({ value, onChange, options }: GroupingMenuProps) {
  const count = value && value !== "none" ? 1 : 0;
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
          checked={!value || value === "none"}
          onCheckedChange={() => onChange("none")}
        >
          Sin agrupar
        </DropdownMenuCheckboxItem>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={value === option.value}
            onCheckedChange={(checked) =>
              onChange(checked ? option.value : "none")
            }
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
