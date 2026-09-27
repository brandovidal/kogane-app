import { useMemo } from "react";
import { Check, ChevronDown, CircleOff, Search } from "lucide-react";

import { CategoryIcon, CATEGORY_ICON_OPTIONS } from "@/shared/components/CategoryIcon";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  createComboboxItems,
} from "@/ui/combobox";

const NO_ICON = "__no_icon__";
const pickerOptions = [
  { value: NO_ICON, label: "Sin icono" },
  ...CATEGORY_ICON_OPTIONS.map(({ value, label }) => ({ value, label })),
];

export function CategoryIconPicker({
  value,
  color,
  onChange,
}: {
  value: string | null;
  color: string;
  onChange: (value: string | null) => void;
}) {
  const items = useMemo(
    () => createComboboxItems(pickerOptions, {
      getValue: (option) => option.value,
      getLabel: (option) => option.label,
    }),
    [],
  );
  const selectedValue = value ?? NO_ICON;

  return (
    <Combobox
      items={items}
      value={selectedValue}
      onValueChange={(next) => onChange(next == null || next === NO_ICON ? null : String(next))}
      autoHighlight
    >
      <ComboboxTrigger aria-label="Icono de categoría" className="w-full">
        <span className="inline-flex min-w-0 items-center gap-2">
          {value ? <CategoryIcon icon={value} color={color} size="xs" /> : <CircleOff className="size-4 text-muted-foreground" />}
          <ComboboxValue placeholder="Sin icono" />
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </ComboboxTrigger>
      <ComboboxContent aria-label="Iconos de categoría">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <ComboboxInput
              aria-label="Buscar icono"
              placeholder="Buscar icono..."
              autoComplete="off"
              className="pl-8"
            />
          </div>
        </div>
        <ComboboxList className="max-h-64 overflow-y-auto p-1">
          {(option: (typeof pickerOptions)[number]) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.value === NO_ICON ? (
                <CircleOff className="size-4 text-muted-foreground" />
              ) : (
                <CategoryIcon icon={option.value} color={color} size="xs" />
              )}
              <span className="flex-1">{option.label}</span>
              <ComboboxItemIndicator><Check className="size-4" /></ComboboxItemIndicator>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty className="px-3 py-6 text-center text-sm text-muted-foreground">
          No se encontraron iconos.
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
