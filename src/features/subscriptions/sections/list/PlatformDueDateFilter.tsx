import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePicker } from "@/shared/components/forms/DatePicker";
import { MonthYearPicker } from "@/shared/components/navigation/MonthYearPicker";
import { usePeriod } from "@/shared/stores/period.store";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";

type DuePeriodMode = "month" | "year" | "range";
type MonthYear = { month: number; year: number };

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const monthBounds = ({ month, year }: MonthYear) => ({
  from: toDateKey(new Date(year, month - 1, 1)),
  to: toDateKey(new Date(year, month, 0)),
});

const yearBounds = (year: number) => ({
  from: `${year}-01-01`,
  to: `${year}-12-31`,
});

function monthYearFromDate(value?: string): MonthYear | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function initialMode(filters: ExpenseFilterValues): DuePeriodMode {
  const from = filters.dueFrom?.slice(0, 10);
  const to = filters.dueTo?.slice(0, 10);
  if (!from || !to) return from || to ? "range" : "month";

  const anchor = monthYearFromDate(from);
  if (!anchor) return "range";
  const month = monthBounds(anchor);
  if (from === month.from && to === month.to) return "month";
  const year = yearBounds(anchor.year);
  return from === year.from && to === year.to ? "year" : "range";
}

export function PlatformDueDateFilter({
  filters,
  onFiltersChange,
}: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
}) {
  const periodMonth = usePeriod((state) => state.month);
  const periodYear = usePeriod((state) => state.year);
  const [mode, setMode] = useState<DuePeriodMode>(() => initialMode(filters));
  const [anchor, setAnchor] = useState<MonthYear>(() =>
    monthYearFromDate(filters.dueFrom) ?? {
      month: periodMonth,
      year: periodYear,
    },
  );
  const isApplied = Boolean(filters.dueFrom || filters.dueTo);

  const selectMonth = (next: MonthYear) => {
    setAnchor(next);
    const bounds = monthBounds(next);
    onFiltersChange({ ...filters, dueFrom: bounds.from, dueTo: bounds.to });
  };
  const selectYear = (year: number) => {
    setAnchor((current) => ({ ...current, year }));
    const bounds = yearBounds(year);
    onFiltersChange({ ...filters, dueFrom: bounds.from, dueTo: bounds.to });
  };
  const movePeriod = (amount: number) => {
    if (mode === "year") {
      selectYear(anchor.year + amount);
      return;
    }
    const date = new Date(anchor.year, anchor.month - 1 + amount, 1);
    selectMonth({ month: date.getMonth() + 1, year: date.getFullYear() });
  };
  const selectMode = (next: DuePeriodMode) => {
    setMode(next);
    if (next === "month") selectMonth(anchor);
    if (next === "year") selectYear(anchor.year);
  };
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="eyebrow flex items-center gap-1.5">
          Próximo cobro
          {isApplied && (
            <span className="normal-case tracking-normal text-brand">
              · 1 aplicado
            </span>
          )}
        </div>
        <div
          role="radiogroup"
          aria-label="Período del próximo cobro"
          className="flex rounded-lg bg-muted p-1"
        >
          {([
            ["month", "Mes"],
            ["year", "Año"],
            ["range", "Rango"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => selectMode(value)}
              className={cn(
                "h-7 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors",
                mode === value && "bg-background text-foreground shadow-sm",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode !== "range" ? (
        <div className="flex h-9 items-center justify-between rounded-lg border border-brand/60 bg-brand/5 px-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={mode === "year" ? "Año anterior" : "Mes anterior"}
            onClick={() => movePeriod(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          {mode === "month" ? (
            <MonthYearPicker
              value={anchor}
              onChange={selectMonth}
              ariaLabel="Próximo cobro"
              className="h-8 w-auto border-0 bg-transparent px-2 hover:bg-transparent"
            />
          ) : (
            <span className="text-sm font-semibold tabular-nums">
              {anchor.year}
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={mode === "year" ? "Año siguiente" : "Mes siguiente"}
            onClick={() => movePeriod(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Desde</div>
            <DatePicker
              ariaLabel="Próximo cobro desde"
              placeholder="Cualquier fecha"
              value={filters.dueFrom}
              active={!!filters.dueFrom}
              maxDate={filters.dueTo}
              onChange={(dueFrom) =>
                onFiltersChange({ ...filters, dueFrom: dueFrom || undefined })
              }
            />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Hasta</div>
            <DatePicker
              ariaLabel="Próximo cobro hasta"
              placeholder="Cualquier fecha"
              value={filters.dueTo}
              active={!!filters.dueTo}
              minDate={filters.dueFrom}
              onChange={(dueTo) =>
                onFiltersChange({ ...filters, dueTo: dueTo || undefined })
              }
            />
          </div>
        </div>
      )}

    </section>
  );
}
