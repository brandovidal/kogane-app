import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, Minus, type LucideIcon } from "lucide-react";

import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { cn } from "@/shared/utils/cn";

export interface ShortFilterOption {
  value: string;
  label: string;
  decoration?: ReactNode;
  color?: string;
  count?: number;
}

export interface ShortFilterFieldsProps {
  label: string;
  value?: string;
  options: readonly ShortFilterOption[];
  onChange: (value: string | undefined) => void;
  mode?: "multi" | "single";
  icon?: LucideIcon;
  width?: string;
  labelClassName?: string;
  containerClassName?: string;
  triggerClassName?: string;
  allLabel?: string;
  activeMarker?: boolean;
}

export function ShortFilterFields({
  label,
  value,
  options,
  onChange,
  mode = "multi",
  icon,
  width = "w-full",
  labelClassName = "text-xs font-medium text-muted-foreground",
  containerClassName,
  triggerClassName,
  allLabel = "Todos",
  activeMarker = false,
}: ShortFilterFieldsProps) {
  const [open, setOpen] = useState(false);
  const isMulti = mode === "multi";
  const selected = useMemo(
    () => (isMulti ? (value?.split(",").filter(Boolean) ?? []) : []),
    [isMulti, value],
  );
  const selectedOptions = isMulti
    ? options.filter((option) => selected.includes(option.value))
    : [];
  const singleOption = !isMulti
    ? options.find((option) => option.value === value)
    : undefined;
  const active = isMulti ? selected.length > 0 : Boolean(singleOption);
  const triggerSummary = isMulti
    ? selectedOptions.length === 0
      ? allLabel
      : selectedOptions.length > 3
        ? `${selectedOptions.length} seleccionados`
        : selectedOptions.map((option) => option.label).join(", ")
    : (singleOption?.label ?? allLabel);
  const allSelected = isMulti && selected.length === 0;
  const allPartial = isMulti && selected.length > 0;
  const selectedCount = isMulti ? selectedOptions.length : Number(active);

  const toggle = (optionValue: string) => {
    if (!isMulti) {
      onChange(optionValue === value ? undefined : optionValue);
      setOpen(false);
      return;
    }
    if (selected.includes(optionValue)) {
      const next = selected.filter((item) => item !== optionValue);
      onChange(next.length ? next.join(",") : undefined);
      return;
    }
    const next = [...selected, optionValue];
    onChange(next.length === options.length ? undefined : next.join(","));
  };

  const renderMark = (checked: boolean, partial = false) => (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
        checked
          ? "border-foreground bg-foreground text-background"
          : "border-muted-foreground/60 bg-transparent",
      )}
    >
      {partial ? (
        <Minus className="size-3" strokeWidth={2.5} />
      ) : (
        checked && <Check className="size-3" strokeWidth={2.5} />
      )}
    </span>
  );

  return (
    <div className={cn("min-w-0 space-y-1.5", containerClassName)}>
      <div className={labelClassName}>
        <FieldLabel
          icon={activeMarker ? undefined : icon}
          className={active && activeMarker ? "text-foreground" : undefined}
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          aria-label={label}
          aria-expanded={open}
          className={cn(
            "inline-flex h-9 min-w-0 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors hover:bg-accent/40 focus-visible:border-brand/70 focus-visible:ring-2 focus-visible:ring-brand/30",
            width,
            active && "border-brand/60 bg-brand/5",
            triggerClassName,
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left",
              active && "text-brand",
            )}
          >
            {triggerSummary}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--anchor-width)] min-w-56 overflow-hidden p-1"
        >
          <div className="max-h-72 overflow-y-auto">
            {isMulti ? (
              <>
                <button
                  type="button"
                  aria-pressed={allSelected}
                  onClick={() => onChange(undefined)}
                  className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-accent"
                >
                  {renderMark(allSelected, allPartial)}
                  <span className="min-w-0 flex-1 truncate">{allLabel}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {options.length}
                  </span>
                </button>
                <div className="my-1 border-t" />
                {options.map((option) => {
                  const checked = selected.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={checked}
                      onClick={() => toggle(option.value)}
                      className={cn(
                        "flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-accent",
                        checked && "bg-accent/70",
                      )}
                    >
                      {renderMark(checked)}
                      {option.decoration}
                      {option.color && (
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      {option.count != null && (
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {option.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <button
                  type="button"
                  aria-pressed={!active}
                  onClick={() => {
                    onChange(undefined);
                    setOpen(false);
                  }}
                  className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-accent"
                >
                  <span className="min-w-0 flex-1 truncate">{allLabel}</span>
                  {!active && <Check className="size-4 shrink-0" />}
                </button>
                <div className="my-1 border-t" />
                {options.map((option) => {
                  const checked = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={checked}
                      onClick={() => toggle(option.value)}
                      className={cn(
                        "flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-accent",
                        checked && "bg-accent/70",
                      )}
                    >
                      {option.decoration}
                      {option.color && (
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      {checked && <Check className="size-4 shrink-0" />}
                    </button>
                  );
                })}
              </>
            )}
          </div>
          {isMulti && (
            <div className="flex items-center justify-between border-t px-2 pt-2 text-xs text-muted-foreground">
              <span>
                {selectedCount
                  ? `${selectedCount} de ${options.length} seleccionados`
                  : `Sin filtro · se muestran todos`}
              </span>
              <button
                type="button"
                className="font-medium text-foreground disabled:cursor-default disabled:opacity-50"
                disabled={!selectedCount}
                onClick={() => onChange(undefined)}
              >
                Limpiar
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
