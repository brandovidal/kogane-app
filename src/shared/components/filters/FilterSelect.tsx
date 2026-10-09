import { useMemo, type ReactNode } from "react";
import { Check, ChevronDown, Minus, Search, type LucideIcon } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxCollection,
  ComboboxSeparator,
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
  group?: string;
  decoration?: ReactNode;
  searchTerms?: readonly string[];
  count?: number;
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
  containerClassName?: string;
  triggerClassName?: string;
  allLabel?: string;
  allTriggerLabel?: string;
  allValue?: string;
  searchable?: boolean;
  active?: boolean;
  multiple?: boolean;
  compactSelectionSummary?: boolean;
  multipleFooter?: boolean;
  emptyDescription?: string;
}

const ALL = "__all__";

function matchesOption(option: FilterSelectOption, query: string) {
  const normalizedQuery = normalize(query);
  return [option.label, ...(option.searchTerms ?? [])].some((text) =>
    normalize(text).includes(normalizedQuery),
  );
}

function FilterOptionItem({
  option,
  multiple,
  allValue,
  selectedValues,
}: {
  option: FilterSelectOption;
  multiple: boolean;
  allValue: string;
  selectedValues: string[];
}) {
  return (
    <ComboboxItem value={option.value}>
      {multiple && (
        <span className="relative inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background">
          {option.value === allValue && selectedValues.length > 0 ? (
            <Minus className="size-3.5" />
          ) : (
            <ComboboxItemIndicator>
              <Check className="size-3.5" />
            </ComboboxItemIndicator>
          )}
        </span>
      )}
      {option.decoration}
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
      {option.count != null && (
        <span className="text-xs tabular-nums text-muted-foreground">{option.count}</span>
      )}
      {!multiple && <ComboboxItemIndicator><Check className="size-4" /></ComboboxItemIndicator>}
    </ComboboxItem>
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
  containerClassName,
  triggerClassName,
  allLabel = "Todos",
  allTriggerLabel,
  allValue = ALL,
  searchable = false,
  active,
  multiple = false,
  compactSelectionSummary = false,
  multipleFooter = false,
  emptyDescription,
}: FilterSelectProps) {
  const isActive = active ?? (value != null && value !== "" && value !== allValue);
  const activeControlClass = isActive
    ? "border-brand/60 bg-brand/5 ring-1 ring-brand/20"
    : undefined;
  const items = useMemo(
    () =>
      createComboboxItems([{ value: allValue, label: allLabel }, ...options], {
        getValue: (option) => option.value,
        getLabel: (option) => option.label,
      }),
    [allLabel, allValue, options],
  );
  const selectedOption = options.find((option) => option.value === value);
  const selectedValues = multiple
    ? (value?.split(",").filter((item) => item && item !== allValue) ?? [])
    : [];
  const selectedOptions = multiple
    ? options.filter((option) => selectedValues.includes(option.value))
    : [];
  const selectedLabel = selectedOptions.length
    ? compactSelectionSummary && selectedOptions.length > 1
      ? `${selectedOptions[0].label} +${selectedOptions.length - 1}`
      : selectedOptions.map((option) => option.label).join(", ")
    : (allTriggerLabel ?? allLabel);
  const hasSearchTerms = options.some((option) => option.searchTerms?.length);
  const groupedOptions = useMemo(() => {
    const groups = new Map<string, FilterSelectOption[]>();
    const ungrouped: FilterSelectOption[] = [];
    for (const option of [{ value: allValue, label: allLabel }, ...options]) {
      if (option.group) {
        groups.set(option.group, [...(groups.get(option.group) ?? []), option]);
      } else {
        ungrouped.push(option);
      }
    }
    return { ungrouped, groups: [...groups] };
  }, [allLabel, allValue, options]);

  return (
    <div className={cn("block min-w-0 space-y-1.5", containerClassName)}>
      <div className={labelClassName}>
        <FieldLabel icon={icon} className={isActive ? "text-brand" : undefined}>{label}</FieldLabel>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {searchable ? (
        <Combobox
          items={items}
          filter={hasSearchTerms ? matchesOption : undefined}
          multiple={multiple}
          value={multiple ? (selectedValues.length ? selectedValues : [allValue]) : value ?? allValue}
          onValueChange={(next) => {
            if (multiple) {
              const rawValues = Array.isArray(next) ? next.map(String) : [];
              if (rawValues.includes(allValue) && selectedValues.length > 0) {
                return onChange(undefined);
              }
              const nextValues = rawValues.filter((item) => item !== allValue);
              return onChange(nextValues.length ? nextValues.join(",") : undefined);
            }
            onChange(next == null || next === allValue ? undefined : String(next));
          }}
          autoHighlight
        >
          <ComboboxTrigger aria-label={label} className={cn(width, activeControlClass, triggerClassName)}>
            {!multiple && selectedOption?.decoration}
            <span className={cn(
              "min-w-0 flex-1 truncate text-left",
              multiple && selectedValues.length > 0 && "text-brand",
            )}>
              {multiple
                ? selectedLabel
                : <ComboboxValue placeholder={allTriggerLabel ?? allLabel} />}
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
              {groupedOptions.ungrouped.length > 0 && (
                <ComboboxGroup items={groupedOptions.ungrouped}>
                  <ComboboxCollection>
                    {(option: FilterSelectOption) => (
                      <FilterOptionItem key={option.value} option={option} multiple={multiple} allValue={allValue} selectedValues={selectedValues} />
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
              {groupedOptions.groups.map(([group, groupOptions], index) => (
                <ComboboxGroup key={group} items={groupOptions}>
                  {(index > 0 || groupedOptions.ungrouped.length > 0) && <ComboboxSeparator className="my-1 h-px bg-border" />}
                  <ComboboxGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{group}</ComboboxGroupLabel>
                  <ComboboxCollection>
                    {(option: FilterSelectOption) => (
                      <FilterOptionItem key={option.value} option={option} multiple={multiple} allValue={allValue} selectedValues={selectedValues} />
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              ))}
            </ComboboxList>
            <ComboboxEmpty className="px-3 py-6 text-center text-sm text-muted-foreground">
              {emptyDescription ?? "No se encontraron opciones."}
            </ComboboxEmpty>
            {multipleFooter && (
              <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
                <span>{selectedValues.length ? `${selectedValues.length} seleccionadas` : "Sin filtro · se muestran todas"}</span>
                <button
                  type="button"
                  className="font-medium text-foreground disabled:cursor-default disabled:opacity-50"
                  disabled={!selectedValues.length}
                  onClick={() => onChange(undefined)}
                >
                  Limpiar
                </button>
              </div>
            )}
          </ComboboxContent>
        </Combobox>
      ) : (
        <Select
          value={value ?? allValue}
          onValueChange={(next) =>
            onChange(next === allValue ? undefined : next)
          }
        >
          <SelectTrigger className={cn("h-9", width, activeControlClass, triggerClassName)} aria-label={label}>
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
