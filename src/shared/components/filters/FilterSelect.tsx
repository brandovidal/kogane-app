import { useMemo, type ReactNode } from "react";
import { Check, ChevronDown, Search, type LucideIcon } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

import { FieldLabel } from "@/shared/components/forms/FieldLabel";

import { cn } from "@/shared/utils/cn";
import { normalize } from "@/shared/lib/text";

export interface FilterSelectOption {
  value: string;
  label: string;
  decoration?: ReactNode;
  searchTerms?: readonly string[];
}

export interface FilterSelectProps {
  label: string;
  icon?: LucideIcon;
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

function matchesOption(option: FilterSelectOption, query: string) {
  const normalizedQuery = normalize(query);
  return [option.label, ...(option.searchTerms ?? [])].some((text) =>
    normalize(text).includes(normalizedQuery),
  );
}

export function FilterSelect({
  label,
  icon,
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
      createComboboxItems([{ value: allValue, label: allLabel }, ...options], {
        getValue: (option) => option.value,
        getLabel: (option) => option.label,
      }),
    [allLabel, allValue, options],
  );
  const selectedOption = options.find((option) => option.value === value);
  const hasSearchTerms = options.some((option) => option.searchTerms?.length);

  return (
    <div className="block min-w-0 space-y-1.5">
      <div className={labelClassName}>
        <FieldLabel icon={icon}>{label}</FieldLabel>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {searchable ? (
        <Combobox
          items={items}
          filter={hasSearchTerms ? matchesOption : undefined}
          value={value ?? allValue}
          onValueChange={(next) =>
            onChange(
              next == null || next === allValue ? undefined : String(next),
            )
          }
          autoHighlight
        >
          <ComboboxTrigger aria-label={label} className={cn(width)}>
            {selectedOption?.decoration}
            <span className="min-w-0 flex-1 truncate text-left">
              <ComboboxValue placeholder={allLabel} />
            </span>
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </ComboboxTrigger>
          <ComboboxContent
            aria-label={`Opciones de ${label.toLocaleLowerCase()}`}
          >
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
                  {option.decoration}
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
          onValueChange={(next) =>
            onChange(next === allValue ? undefined : next)
          }
        >
          <SelectTrigger className={`h-9 ${width}`} aria-label={label}>
            {selectedOption?.decoration}
            <SelectValue placeholder={label}>
              {selectedOption?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allValue}>{allLabel}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.decoration}
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
