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
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";

export interface MultiSelectOption {
  value: string;
  label: string;
  group?: string;
  color?: string;
  decoration?: ReactNode;
  searchTerms?: readonly string[];
  count?: number;
  separatorBefore?: boolean;
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
  emptyDescription?: string | ((query: string) => ReactNode);
  emptySelectionLabel?: string;
  summaryMode?: "field" | "chip" | "person";
  presentation?: "popover" | "inline" | "responsive-sheet";
  emptyValueMeansAll?: boolean;
  highlightMatches?: boolean;
  hierarchicalGroups?: boolean;
  circularSelectionMarks?: boolean;
  listClassName?: string;
}

function SelectionMark({
  checked,
  circular = false,
}: {
  checked: boolean | "indeterminate";
  circular?: boolean;
}) {
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
      className={cn(
        "inline-flex size-[18px] shrink-0 items-center justify-center border border-input bg-background text-primary-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
        circular ? "rounded-full" : "rounded-[5px]",
      )}
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
  presentation = "popover",
  emptyValueMeansAll = false,
  highlightMatches = false,
  hierarchicalGroups = false,
  circularSelectionMarks = false,
  listClassName,
}: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 639px)");
  const useMobileSheet = presentation === "responsive-sheet" && isMobile;
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
    options.length > 0 && options.every((option) => selected.has(option.value));
  const noFilter = value === null || (emptyValueMeansAll && value.length === 0);
  const allChecked = (value === null && !emptyValueMeansAll) || allSelected;
  const isSelected = (optionValue: string) =>
    selected.has(optionValue) || (value === null && !emptyValueMeansAll);
  const active = !noFilter && !allSelected;
  const selectedNames = selectedValues.map(
    (value) => options.find((option) => option.value === value)?.label ?? value,
  );
  const summaryAccessibleText =
    noFilter || allSelected
      ? allLabel
      : selectedValues.length === 0
        ? emptySelectionLabel
        : `${selectedValues.length} seleccionadas`;
  const summary =
    noFilter || allSelected ? (
      allLabel
    ) : selectedValues.length === 0 ? (
      emptySelectionLabel
    ) : summaryMode === "person" ? (
      selectedValues.length === 1 ? (
        (selectedNames[0] ?? selectedValues[0])
      ) : selectedValues.length < 3 ? (
        <>
          <span className="truncate">{selectedNames.join(", ")}</span>
          <span className="shrink-0 font-semibold text-brand">
            {selectedValues.length}
          </span>
        </>
      ) : (
        `${selectedValues.length} seleccionadas`
      )
    ) : summaryMode === "chip" ? (
      selectedValues.length === 1 ? (
        (options.find((option) => option.value === selectedValues[0])?.label ??
        selectedValues[0])
      ) : (
        `${options.find((option) => option.value === selectedValues[0])?.label ?? selectedValues[0]} +${selectedValues.length - 1}`
      )
    ) : selectedValues.length < 3 ? (
      options
        .filter((option) => selected.has(option.value))
        .map((option) => option.label)
        .join(", ")
    ) : (
      `${selectedValues.length} seleccionados`
    );

  const updateSelection = (next: string[]) => {
    onChange(
      options.length > 0 &&
        next.length === options.length &&
        !emptyValueMeansAll
        ? null
        : next,
    );
  };
  const toggle = (optionValue: string) => {
    const current = selectedValues;
    updateSelection(
      isSelected(optionValue)
        ? value === null && !emptyValueMeansAll
          ? options
              .map((option) => option.value)
              .filter((item) => item !== optionValue)
          : current.filter((item) => item !== optionValue)
        : [...current, optionValue],
    );
  };
  const toggleGroup = (items: MultiSelectOption[]) => {
    const groupValues = items.map((item) => item.value);
    const everySelected = groupValues.every((item) => isSelected(item));
    const current = selectedValues;
    updateSelection(
      everySelected
        ? value === null && !emptyValueMeansAll
          ? options
              .map((option) => option.value)
              .filter((item) => !groupValues.includes(item))
          : current.filter((item) => !groupValues.includes(item))
        : [...new Set([...current, ...groupValues])],
    );
  };
  const toggleAll = () => {
    if (emptyValueMeansAll) {
      onChange(allSelected ? [] : options.map((option) => option.value));
      return;
    }
    onChange(allChecked ? [] : null);
  };

  const resetSelection = () => onChange(emptyValueMeansAll ? [] : null);
  const matchCount = visibleGroups.reduce(
    (count, [, items]) => count + items.length,
    0,
  );
  const noResults = visibleGroups.length === 0 && normalizedQuery;
  const renderLabel = (text: string) => {
    if (!highlightMatches || !query.trim()) return text;
    const index = text
      .toLocaleLowerCase()
      .indexOf(query.trim().toLocaleLowerCase());
    if (index < 0) return text;
    const match = text.slice(index, index + query.trim().length);
    return (
      <>
        {text.slice(0, index)}
        <span className="rounded-sm bg-brand/15 text-brand">{match}</span>
        {text.slice(index + match.length)}
      </>
    );
  };

  const selectionContent = (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-popover",
        presentation === "popover" && "rounded-none border-0",
      )}
    >
      {searchable && (
        <div className="border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus={presentation !== "inline"}
              aria-label={`Buscar ${label.toLocaleLowerCase()}`}
              placeholder={`Buscar ${label.toLocaleLowerCase()}...`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}
      <div className={cn("max-h-60 overflow-y-auto p-1", listClassName)}>
        {(!normalizedQuery ||
          normalize(allLabel).includes(normalizedQuery)) && (
          <button
            type="button"
            role="checkbox"
            aria-checked={allChecked ? true : value?.length ? "mixed" : false}
            onClick={toggleAll}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium hover:bg-accent"
          >
            <SelectionMark
              checked={
                allChecked ? true : value?.length ? "indeterminate" : false
              }
              circular={circularSelectionMarks}
            />
            <span className="flex-1">{allLabel}</span>
            {hierarchicalGroups && (
              <span className="text-xs tabular-nums text-muted-foreground">
                {options.length}
              </span>
            )}
          </button>
        )}
        {noResults ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {typeof emptyDescription === "function"
              ? emptyDescription(query.trim())
              : emptyDescription}
          </p>
        ) : (
          visibleGroups.map(([group, items]) => {
            const chosen = items.filter((item) =>
              isSelected(item.value),
            ).length;
            const groupChecked = chosen === items.length;
            const groupState = groupChecked
              ? true
              : chosen > 0
                ? "indeterminate"
                : false;
            return (
              <section
                key={group || "ungrouped"}
                className={cn(hierarchicalGroups && "mt-1 border-t pt-1")}
              >
                {group && (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={
                      groupState === "indeterminate" ? "mixed" : groupState
                    }
                    onClick={() => toggleGroup(items)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      hierarchicalGroups && "bg-muted/50",
                    )}
                  >
                    <SelectionMark
                      checked={groupState}
                      circular={circularSelectionMarks}
                    />
                    <span className="flex-1">{group}</span>
                    {hierarchicalGroups && (
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          chosen > 0 && "text-brand",
                        )}
                      >
                        {chosen}/{items.length}
                      </span>
                    )}
                  </button>
                )}
                <div
                  className={cn(
                    hierarchicalGroups &&
                      group &&
                      "ml-[9px] border-l border-border/70 pl-2",
                  )}
                >
                  {items.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected(option.value)}
                      onClick={() => toggle(option.value)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent",
                        hierarchicalGroups &&
                          isSelected(option.value) &&
                          "bg-accent/60",
                        option.separatorBefore && "mt-1 border-t pt-2",
                      )}
                    >
                      <SelectionMark
                        checked={isSelected(option.value)}
                        circular={circularSelectionMarks}
                      />
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
                        {renderLabel(option.label)}
                      </span>
                      {option.count != null && (
                        <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
                          {option.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <span>
          {normalizedQuery
            ? `${matchCount} resultado${matchCount === 1 ? "" : "s"}`
            : noFilter
              ? `Sin filtro · se muestran ${emptyValueMeansAll ? "todas" : "todos"}`
              : `${value?.length ?? 0} ${emptyValueMeansAll ? "seleccionadas" : "seleccionados"}`}
        </span>
        <button
          type="button"
          className="font-medium text-foreground disabled:cursor-default disabled:opacity-50"
          disabled={!normalizedQuery && noFilter}
          onClick={() => {
            if (normalizedQuery) setQuery("");
            else resetSelection();
          }}
        >
          Limpiar
        </button>
      </div>
    </div>
  );

  const trigger = (
    <button
      type="button"
      aria-label={`${label}: ${summaryAccessibleText}`}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        width,
        active && "border-brand/60 bg-brand/5 ring-1 ring-brand/20",
        triggerClassName,
      )}
    >
      <span
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 truncate text-left",
          active && "text-brand",
        )}
      >
        {summary}
      </span>
      <ChevronDown className="size-4 shrink-0 opacity-50" />
    </button>
  );

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
      {presentation === "inline" ? (
        selectionContent
      ) : useMobileSheet ? (
        <Sheet
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) setQuery("");
          }}
        >
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85dvh] gap-0 overflow-hidden rounded-t-xl p-0"
          >
            <SheetHeader className="shrink-0 border-b px-4 py-3">
              <SheetTitle>{label}</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 overflow-y-auto p-4">
              {selectionContent}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) setQuery("");
          }}
        >
          <PopoverTrigger render={trigger} />
          <PopoverContent
            align="start"
            className="w-(--anchor-width) min-w-64 overflow-hidden p-0"
          >
            {selectionContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
