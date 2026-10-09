import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import type { DailyExpense } from "@/shared/api/types";
import { formatPlatformTotals } from "@/features/subscriptions/lib/platform-summary";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/ui/button";
import { dayLabel } from "../lib/day-label";
import {
  buildMonthGrid,
  WEEKDAY_HEADERS,
  type DayCell,
} from "../lib/month-grid";

const localDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Calendario (board DiaCalendario): the month by weeks with each day's total, and a panel with the expenses of the chosen day
export function DailyCalendar({
  year,
  month,
  expenses,
  onEdit,
  onNewExpense,
}: {
  year: number;
  month: number;
  expenses: DailyExpense[];
  onEdit: (expense: DailyExpense) => void;
  onNewExpense: () => void;
}) {
  // Today depends on the browser clock: only after mount, so the server HTML matches
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const todayKey = today ? localDay(today) : null;

  const weeks = useMemo(
    () => buildMonthGrid(year, month, expenses),
    [year, month, expenses],
  );
  const cells = weeks.flat();
  const [chosen, setChosen] = useState<string | null>(null);
  const selectedKey =
    chosen && cells.some((cell) => cell.day === chosen && cell.inMonth)
      ? chosen
      : todayKey && cells.some((cell) => cell.day === todayKey && cell.inMonth)
        ? todayKey
        : (cells.find((cell) => cell.inMonth && cell.expenses.length)?.day ??
          cells.find((cell) => cell.inMonth)?.day ??
          null);
  const selected = cells.find((cell) => cell.day === selectedKey);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div role="grid" aria-label="Calendario de gastos" className="space-y-1">
        <div role="row" className="grid grid-cols-7 gap-1">
          {WEEKDAY_HEADERS.map((weekday) => (
            <div
              key={weekday}
              role="columnheader"
              className="px-1 text-center text-xs text-muted-foreground"
            >
              {weekday}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0].day} role="row" className="grid grid-cols-7 gap-1">
            {week.map((cell) => (
              <DayButton
                key={cell.day}
                cell={cell}
                today={cell.day === todayKey}
                selected={cell.day === selectedKey}
                onSelect={() => cell.inMonth && setChosen(cell.day)}
              />
            ))}
          </div>
        ))}
      </div>

      <aside
        aria-label="Gastos del día"
        className="space-y-3 rounded-xl border p-4"
      >
        {selected ? (
          <>
            <div>
              <h3 className="text-sm font-semibold">
                {dayLabel(selected.day, today)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selected.expenses.length}{" "}
                {selected.expenses.length === 1 ? "gasto" : "gastos"}
              </p>
            </div>
            {selected.expenses.length ? (
              <ul className="divide-y">
                {selected.expenses.map((expense) => (
                  <li key={expense.id}>
                    <button
                      type="button"
                      onClick={() => onEdit(expense)}
                      className="flex w-full items-center justify-between gap-2 py-2 text-left text-sm hover:text-primary"
                    >
                      <span className="min-w-0 truncate">
                        {expense.description}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin gastos este día.
              </p>
            )}
            <div className="flex items-center justify-between border-t pt-2 text-sm font-medium">
              <span>Total del día</span>
              <span className="tabular-nums">
                {formatPlatformTotals(selected.totals)}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={onNewExpense}>
              <Plus aria-hidden="true" /> Nuevo gasto
            </Button>
          </>
        ) : null}
      </aside>
    </div>
  );
}

function DayButton({
  cell,
  today,
  selected,
  onSelect,
}: {
  cell: DayCell<DailyExpense>;
  today: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="gridcell"
      disabled={!cell.inMonth}
      aria-selected={selected}
      aria-current={today ? "date" : undefined}
      onClick={onSelect}
      className={cn(
        "flex min-h-16 flex-col items-start gap-0.5 rounded-lg border p-1.5 text-left text-xs transition-colors sm:min-h-20",
        cell.inMonth ? "hover:bg-muted/50" : "opacity-30",
        selected && "border-primary bg-primary/5",
        today && "ring-1 ring-primary/60",
      )}
    >
      <span className="font-medium tabular-nums">{cell.date}</span>
      {cell.expenses.length > 0 && (
        <span className="w-full truncate text-[11px] tabular-nums text-muted-foreground">
          {formatPlatformTotals(cell.totals)}
        </span>
      )}
    </button>
  );
}
