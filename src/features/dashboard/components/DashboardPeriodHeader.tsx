import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import { PERIOD_YEAR_MAX, PERIOD_YEAR_MIN } from "@/shared/constants/period";

export function DashboardPeriodHeader() {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const navigate = usePeriod((state) => state.navigate);
  const setPeriod = usePeriod((state) => state.setPeriod);
  const [open, setOpen] = useState(false);
  const [gridYear, setGridYear] = useState(year);
  const isCurrent = month === getCurrentMonth() && year === getCurrentYear();
  const isPast = year * 12 + month < getCurrentYear() * 12 + getCurrentMonth();
  const billedMonth = getCurrentMonth() === 1 ? 12 : getCurrentMonth() - 1;
  const billedYear =
    getCurrentMonth() === 1 ? getCurrentYear() - 1 : getCurrentYear();

  return (
    <div
      className="flex items-center gap-1 rounded-lg border bg-card p-1"
      aria-label="Período del dashboard"
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Mes anterior"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setGridYear(year);
        }}
      >
        <PopoverTrigger
          type="button"
          className="flex h-8 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <CalendarDays className="size-4 text-muted-foreground" />
          <span>
            {getMonthName(month)} {year}
          </span>
          {(isCurrent || isPast) && (
            <Badge
              variant="outline"
              className={
                isCurrent
                  ? "border-emerald-500/30 bg-emerald-500/10 px-2 text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 px-2 text-amber-300"
              }
            >
              {isCurrent ? "En curso" : "Facturado"}
            </Badge>
          )}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[22rem] space-y-3 rounded-xl p-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setPeriod(billedMonth, billedYear);
                setOpen(false);
              }}
              className={`rounded-lg border p-2.5 text-left transition-colors hover:bg-muted ${month === billedMonth && year === billedYear ? "border-amber-500/50 bg-amber-500/10" : ""}`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Mes facturado
              </span>
              <span className="mt-0.5 block text-sm font-medium">
                {getMonthName(billedMonth)} {billedYear}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriod(getCurrentMonth(), getCurrentYear());
                setOpen(false);
              }}
              className={`rounded-lg border p-2.5 text-left transition-colors hover:bg-muted ${isCurrent ? "border-emerald-500/50 bg-emerald-500/10" : ""}`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                En curso
              </span>
              <span className="mt-0.5 block text-sm font-medium">
                {getMonthName(getCurrentMonth())} {getCurrentYear()}
              </span>
            </button>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Año anterior"
              disabled={gridYear <= PERIOD_YEAR_MIN}
              onClick={() => setGridYear((value) => value - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-semibold tabular-nums">
              {gridYear}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Año siguiente"
              disabled={gridYear >= PERIOD_YEAR_MAX}
              onClick={() => setGridYear((value) => value + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 12 }, (_, index) => {
              const selected = month === index + 1 && year === gridYear;
              const future =
                gridYear * 12 + index + 1 >
                getCurrentYear() * 12 + getCurrentMonth();
              return (
                <button
                  key={index}
                  type="button"
                  aria-pressed={selected}
                  disabled={future}
                  onClick={() => {
                    setPeriod(index + 1, gridYear);
                    setOpen(false);
                  }}
                  className={`h-9 rounded-md text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/40 ${selected ? "bg-primary font-semibold text-primary-foreground hover:bg-primary" : ""}`}
                >
                  {getMonthName(index + 1).slice(0, 3)}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Mes siguiente"
        onClick={() => navigate(1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
