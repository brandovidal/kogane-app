import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from "@/shared/lib/dates";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { useFixedCostPeriodMode } from "../../hooks/useFixedCostPeriodMode";
import {
  FIXED_COST_VIEW_PERIOD,
  isFixedCostView,
  monthIndexKey,
  monthKeyIndex,
  monthRangeLabel,
} from "../../lib/fixed-cost-views";

type PeriodValues = {
  month?: string;
  year?: string;
  desde?: string;
  hasta?: string;
};
type PeriodMode = "month" | "year" | "range" | "all";

const PERIOD_KEYS = ["month", "year", "desde", "hasta"] as const;
const MODES: { value: PeriodMode; label: string }[] = [
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
  { value: "range", label: "Rango" },
  { value: "all", label: "Todo" },
];

export function FixedCostPeriodSelector() {
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const [values, setValues] = useUrlFilters<PeriodValues>(PERIOD_KEYS, {
    month: String(currentMonth),
    year: String(currentYear),
  });
  const [{ vista }] = useUrlFilters<{ vista?: string }>(["vista"]);
  const view = isFixedCostView(vista) ? vista : "mes";
  const scope = FIXED_COST_VIEW_PERIOD[view];
  const [open, setOpen] = useState(false);
  const mode = useFixedCostPeriodMode(values, scope);
  const month = Number(values.month) || currentMonth;
  const year = Number(values.year) || currentYear;
  const [gridYear, setGridYear] = useState(year);
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const isCurrent =
    mode === "month" && month === currentMonth && year === currentYear;
  const nowIndex = currentYear * 12 + currentMonth - 1;

  const write = (next: PeriodValues) =>
    setValues({ desde: undefined, hasta: undefined, ...next });
  const setMonth = (index: number) =>
    write({
      month: String((index % 12) + 1),
      year: String(Math.floor(index / 12)),
    });
  const setYear = (nextYear: number) =>
    write({ month: undefined, year: String(nextYear) });
  const setRange = (from: number, to: number) =>
    write({
      month: undefined,
      year: undefined,
      desde: monthIndexKey(Math.min(from, to)),
      hasta: monthIndexKey(Math.max(from, to)),
    });
  const changeMode = (next: PeriodMode) => {
    setRangeStart(null);
    if (next === "month") setMonth(year * 12 + month - 1);
    if (next === "year") setYear(year);
    if (next === "range")
      setRange(year * 12 + month - 3, year * 12 + month - 1);
    if (next === "all") write({ month: undefined, year: undefined });
  };
  const label =
    mode === "month"
      ? `${getMonthName(month)} ${year}`
      : mode === "year"
        ? String(year)
        : mode === "range"
          ? monthRangeLabel(values.desde, values.hasta)
          : "Todos los períodos";
  const fromIndex = monthKeyIndex(values.desde);
  const toIndex = monthKeyIndex(values.hasta);
  const monthState = (index: number) => {
    if (mode === "month")
      return index === year * 12 + month - 1 ? "edge" : null;
    if (mode === "range") {
      if (rangeStart != null) return index === rangeStart ? "edge" : null;
      if (index === fromIndex || index === toIndex) return "edge";
      if (
        fromIndex != null &&
        toIndex != null &&
        index > fromIndex &&
        index < toIndex
      )
        return "inside";
    }
    if (mode === "year")
      return Math.floor(index / 12) === year ? "inside" : null;
    return null;
  };
  const pickMonth = (index: number) => {
    if (mode === "range") {
      if (rangeStart == null) return setRangeStart(index);
      setRange(rangeStart, index);
      setRangeStart(null);
      return setOpen(false);
    }
    setMonth(index);
    setOpen(false);
  };
  const presets: { label: string; apply: () => void }[] = [
    { label: "Este mes", apply: () => setMonth(nowIndex) },
    { label: "Mes pasado", apply: () => setMonth(nowIndex - 1) },
    { label: "Últimos 3 meses", apply: () => setRange(nowIndex - 2, nowIndex) },
    { label: "Este año", apply: () => setYear(currentYear) },
  ];

  return (
    <div className="flex items-center">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setGridYear(year);
          setRangeStart(null);
        }}
      >
        <PopoverTrigger
          type="button"
          aria-label={`Período: ${label}. Cambiar mes, año o rango`}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3.5 text-sm font-semibold outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CalendarDays className="size-4 text-muted-foreground" />
          {isCurrent && (
            <span
              aria-label="Mes actual"
              className="size-1.5 rounded-full bg-brand"
            />
          )}
          <span className="tabular-nums">{label}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 space-y-3 rounded-xl p-3">
          {scope === "month" && (
            <div
              role="radiogroup"
              aria-label="Tipo de período"
              className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1"
            >
              {MODES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={mode === option.value}
                  onClick={() => changeMode(option.value)}
                  className={cn(
                    "h-7 rounded-md text-xs font-medium text-muted-foreground transition-colors",
                    mode === option.value &&
                      "bg-background text-foreground shadow-sm",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Año anterior"
              onClick={() =>
                mode === "year" ? setYear(year - 1) : setGridYear(gridYear - 1)
              }
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-semibold tabular-nums">
              {mode === "year" ? year : gridYear}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Año siguiente"
              onClick={() =>
                mode === "year" ? setYear(year + 1) : setGridYear(gridYear + 1)
              }
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          {mode !== "year" && mode !== "all" && (
            <>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 12 }, (_, offset) => {
                  const index = gridYear * 12 + offset;
                  const state = monthState(index);
                  return (
                    <button
                      key={offset}
                      type="button"
                      aria-pressed={state === "edge"}
                      onClick={() => pickMonth(index)}
                      className={cn(
                        "relative h-9 rounded-md text-sm transition-colors hover:bg-accent",
                        state === "inside" && "rounded-none bg-brand/15",
                        state === "edge" &&
                          "bg-brand font-semibold text-background hover:bg-brand",
                      )}
                    >
                      {getMonthName(offset + 1).slice(0, 3)}
                      {index === nowIndex && state !== "edge" && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              {mode === "range" && (
                <p className="text-xs text-muted-foreground">
                  {rangeStart == null
                    ? "Elige el mes de inicio y luego el de fin."
                    : "Ahora elige el mes de fin."}
                </p>
              )}
            </>
          )}
          {scope === "month" && (
            <div className="flex flex-wrap gap-1.5 border-t pt-3">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    preset.apply();
                    setOpen(false);
                  }}
                  className="h-7 rounded-full border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
