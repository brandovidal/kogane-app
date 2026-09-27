import { useMemo } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

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
import { cn } from "@/shared/lib/utils";
import { CategoryIcon } from "@/shared/components/CategoryIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

export interface FilterSelectOption {
  value: string;
  label: string;
  icon?: string | null;
  color?: string | null;
}

interface FilterSelectProps {
  label: string;
  value: string | undefined;
  options: FilterSelectOption[];
  onChange: (value: string | undefined) => void;
  width?: string;
  description?: string;
  labelClassName?: string;
  allLabel?: string;
  allValue?: string;
  searchable?: boolean;
}

const ALL = "__all__";

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  width = "w-[150px]",
  description,
  labelClassName = "text-xs font-medium text-muted-foreground",
  allLabel = "Todos",
  allValue = ALL,
  searchable = false,
}: FilterSelectProps) {
  const items = useMemo(
    () =>
      createComboboxItems(
        [{ value: allValue, label: allLabel }, ...options],
        {
          getValue: (option) => option.value,
          getLabel: (option) => option.label,
        },
      ),
    [allLabel, allValue, options],
  );
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="block space-y-1.5">
      <div className={labelClassName}>{label}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {searchable ? (
        <Combobox
          items={items}
          value={value ?? allValue}
          onValueChange={(next) =>
            onChange(next == null || next === allValue ? undefined : String(next))
          }
          autoHighlight
        >
          <ComboboxTrigger aria-label={label} className={cn(width)}>
            {selectedOption && (selectedOption.icon || selectedOption.color) && (
              <CategoryIcon icon={selectedOption.icon} color={selectedOption.color} size="xs" />
            )}
            <ComboboxValue placeholder={allLabel} />
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </ComboboxTrigger>
          <ComboboxContent aria-label={`Opciones de ${label.toLocaleLowerCase()}`}>
            <div className="border-b p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <ComboboxInput
                  aria-label={`Buscar ${label.toLocaleLowerCase()}`}
                  placeholder={`Buscar ${label.toLocaleLowerCase()}...`}
                  autoComplete="off"
                  className="pl-8"
                />
              </div>
            </div>
            <ComboboxList className="max-h-60 overflow-y-auto p-1">
              {(option: FilterSelectOption) => (
                <ComboboxItem key={option.value} value={option.value}>
                  {(option.icon || option.color) && (
                    <CategoryIcon icon={option.icon} color={option.color} size="xs" />
                  )}
                  {option.label}
                  <ComboboxItemIndicator>
                    <Check className="size-4" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty className="px-3 py-6 text-center text-sm text-muted-foreground">
              No se encontraron opciones.
            </ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      ) : (
        <Select
          value={value ?? allValue}
          onValueChange={(next) => onChange(next === allValue ? undefined : next)}
        >
          <SelectTrigger className={`h-9 ${width}`} aria-label={label}>
            {selectedOption && (selectedOption.icon || selectedOption.color) && (
              <CategoryIcon icon={selectedOption.icon} color={selectedOption.color} size="xs" />
            )}
            <SelectValue placeholder={label}>
              {selectedOption?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allValue}>{allLabel}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {(option.icon || option.color) && (
                  <CategoryIcon icon={option.icon} color={option.color} size="xs" />
                )}
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
