import { useMemo, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Minus,
  Search,
  type LucideIcon,
} from "lucide-react";

import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { Input } from "@/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { cn } from "@/shared/utils/cn";
import { normalize } from "@/shared/lib/text";

export interface MultiSelectOption {
  value: string;
  label: string;
  group?: string;
  color?: string;
  decoration?: ReactNode;
  searchTerms?: readonly string[];
  count?: number;
}

export interface MultiSelectProps {
  label: string;
  value: string[] | null;
  options: MultiSelectOption[];
  onChange: (value: string[] | null) => void;
  width?: string;
  allLabel?: string;
  searchable?: boolean;
  activeMarker?: boolean;
  icon?: LucideIcon;
  labelClassName?: string;
  containerClassName?: string;
  triggerClassName?: string;
  emptyDescription?: string;
  emptySelectionLabel?: string;
  summaryMode?: "field" | "chip";
}

function SelectionMark({ checked }: { checked: boolean | "indeterminate" }) {
  return (
    <span
      aria-hidden="true"
      data-state={
        checked === "indeterminate"
          ? "indeterminate"
          : checked
            ? "checked"
            : "unchecked"
      }
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-lg border border-input bg-background text-primary-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
    >
      {checked === "indeterminate" ? (
        <Minus className="size-3" />
      ) : checked ? (
        <Check className="size-3" />
      ) : null}
    </span>
  );
}

export function MultiSelect({
  label,
  value,
  options,
  onChange,
  width = "w-full",
  allLabel = "Todos",
  searchable = true,
  activeMarker = false,
  icon,
  labelClassName = "text-xs font-medium text-muted-foreground",
  containerClassName,
  triggerClassName,
  emptyDescription = "No se encontraron opciones.",
  emptySelectionLabel = "Ninguno",
  summaryMode = "field",
}: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(value ?? []), [value]);
  const groups = useMemo(() => {
    const result = new Map<string, MultiSelectOption[]>();
    for (const option of options) {
      const group = option.group ?? "";
      result.set(group, [...(result.get(group) ?? []), option]);
    }
    return [...result];
  }, [options]);
  const normalizedQuery = normalize(query.trim());
  const visibleGroups = groups
    .map(
      ([group, items]) =>
        [
          group,
          items.filter((item) =>
            [item.label, ...(item.searchTerms ?? []), group].some((text) =>
              normalize(text).includes(normalizedQuery),
            ),
          ),
        ] as const,
    )
    .filter(([, items]) => items.length > 0);
  const selectedValues = value ?? [];
  const allSelected =
    options.length > 0 && selectedValues.length === options.length;
  const allChecked = value === null || allSelected;
  const active = value !== null && !allSelected;
  const summary =
    value === null || allSelected
      ? allLabel
      : value.length === 0
        ? emptySelectionLabel
        : summaryMode === "chip"
          ? value.length === 1
            ? (options.find((option) => option.value === value[0])?.label ??
              value[0])
            : `${options.find((option) => option.value === value[0])?.label ?? value[0]} +${value.length - 1}`
          : value.length < 3
            ? options
                .filter((option) => selected.has(option.value))
                .map((option) => option.label)
                .join(", ")
            : `${value.length} seleccionados`;

  const updateSelection = (next: string[]) => {
    onChange(
      options.length > 0 && next.length === options.length ? null : next,
    );
  };
  const toggle = (optionValue: string) => {
    const current = selectedValues;
    updateSelection(
      value === null
        ? [optionValue]
        : selected.has(optionValue)
          ? current.filter((item) => item !== optionValue)
          : [...current, optionValue],
    );
  };
  const toggleGroup = (items: MultiSelectOption[]) => {
    const groupValues = items.map((item) => item.value);
    const everySelected = groupValues.every((item) => selected.has(item));
    const current = selectedValues;
    updateSelection(
      value === null
        ? groupValues
        : everySelected
          ? current.filter((item) => !groupValues.includes(item))
          : [...new Set([...current, ...groupValues])],
    );
  };
  const toggleAll = () => onChange(allChecked ? [] : null);

  return (
    <div className={cn("block min-w-0 space-y-1.5", containerClassName)}>
      <div className={labelClassName}>
        <FieldLabel
          icon={activeMarker ? undefined : icon}
          className={activeMarker && active ? "text-foreground" : undefined}
        >
          {activeMarker && active && (
            <span
              aria-hidden="true"
              className="mr-0.5 size-2 rounded-full bg-brand"
            />
          )}
          {label}
        </FieldLabel>
      </div>
      <Popover
        onOpenChange={(open) => {
          if (!open) setQuery("");
        }}
      >
        <PopoverTrigger
          type="button"
          aria-label={`${label}: ${summary}`}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            width,
            active && "border-brand/60 bg-brand/5 ring-1 ring-brand/20",
            triggerClassName,
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left",
              active && "text-brand",
            )}
          >
            {summary}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--anchor-width) min-w-64 overflow-hidden p-0"
        >
          {searchable && (
            <div className="border-b p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  aria-label={`Buscar ${label.toLocaleLowerCase()}`}
                  placeholder={`Buscar ${label.toLocaleLowerCase()}...`}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1">
            {(!normalizedQuery ||
              normalize(allLabel).includes(normalizedQuery)) && (
              <button
                type="button"
                role="checkbox"
                aria-checked={
                  allChecked ? true : value?.length ? "mixed" : false
                }
                onClick={toggleAll}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
              >
                <SelectionMark
                  checked={
                    allChecked ? true : value?.length ? "indeterminate" : false
                  }
                />
                <span className="flex-1">{allLabel}</span>
              </button>
            )}
            {visibleGroups.length === 0 && normalizedQuery ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyDescription}
              </p>
            ) : (
              visibleGroups.map(([group, items]) => {
                const chosen = items.filter((item) =>
                  selected.has(item.value),
                ).length;
                const groupChecked = chosen === items.length;
                const groupState = groupChecked
                  ? true
                  : chosen > 0
                    ? "indeterminate"
                    : false;
                return (
                  <section key={group || "ungrouped"}>
                    {group && (
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={
                          groupState === "indeterminate" ? "mixed" : groupState
                        }
                        onClick={() => toggleGroup(items)}
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                      >
                        <SelectionMark checked={groupState} />
                        <span>{group}</span>
                      </button>
                    )}
                    {items.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="checkbox"
                        aria-checked={selected.has(option.value)}
                        onClick={() => toggle(option.value)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                      >
                        <SelectionMark checked={selected.has(option.value)} />
                        {option.color && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              option.color,
                            )}
                          />
                        )}
                        {option.decoration}
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
                        {option.count != null && (
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {option.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </section>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <span>
              {value === null
                ? "Sin filtro · se muestran todos"
                : `${value.length} seleccionados`}
            </span>
            <button
              type="button"
              className="font-medium text-foreground disabled:cursor-default disabled:opacity-50"
              disabled={value === null}
              onClick={() => onChange(null)}
            >
              Limpiar
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
