import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { getCurrentMonth, getCurrentYear, getMonthName } from "@/shared/lib/dates";
import { PERIOD_YEAR_MAX, PERIOD_YEAR_MIN } from "@/shared/constants/period";
import type { MonthlyPeriod } from "@/shared/types/period";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { cn } from "@/shared/utils/cn";

export interface MonthYearPickerProps {
  value: MonthlyPeriod;
  onChange: (value: MonthlyPeriod) => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** Compact month picker for forms that need to select a record's period. */
export function MonthYearPicker({
  value,
  onChange,
  ariaLabel = "Período del registro",
  disabled,
  className,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [gridYear, setGridYear] = useState(value.year);
  const isCurrent =
    value.month === getCurrentMonth() && value.year === getCurrentYear();

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setGridYear(value.year);
      }}
    >
      <PopoverTrigger
        type="button"
        disabled={disabled}
        aria-label={`${ariaLabel}: ${getMonthName(value.month)} ${value.year}`}
        className={cn(
          "inline-flex h-9 w-full items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 text-left text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        {isCurrent && <span aria-label="Mes actual" className="size-1.5 shrink-0 rounded-full bg-brand" />}
        <span className="min-w-0 flex-1 truncate tabular-nums">
          {getMonthName(value.month)} {value.year}
        </span>
        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-3 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Año anterior"
            disabled={gridYear <= PERIOD_YEAR_MIN}
            onClick={() => setGridYear((year) => year - 1)}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
          <span className="text-sm font-semibold tabular-nums">{gridYear}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Año siguiente"
            disabled={gridYear >= PERIOD_YEAR_MAX}
            onClick={() => setGridYear((year) => year + 1)}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;
            const selected = value.month === month && value.year === gridYear;
            const current = month === getCurrentMonth() && gridYear === getCurrentYear();
            return (
              <button
                key={month}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  onChange({ month, year: gridYear });
                  setOpen(false);
                }}
                className={cn(
                  "relative h-9 rounded-md text-sm transition-colors hover:bg-accent",
                  selected && "bg-brand font-semibold text-background hover:bg-brand",
                )}
              >
                {getMonthName(month).slice(0, 3)}
                {current && !selected && (
                  <span aria-hidden="true" className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand" />
                )}
              </button>
            );
          })}
        </div>
        <div className="border-t pt-3">
          <button
            type="button"
            className="h-7 rounded-full border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => {
              onChange({ month: getCurrentMonth(), year: getCurrentYear() });
              setOpen(false);
            }}
          >
            Este mes
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
