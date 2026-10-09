import type { DailyExpense } from "@/shared/api/types";
import { formatPlatformTotals } from "@/features/subscriptions/lib/platform-summary";
import { IndicatorsDisclosure } from "@/shared/components/data-display/IndicatorsDisclosure";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDayMonth } from "@/shared/lib/dates";
import { elapsedDays, summarizeDaily } from "../lib/daily-summary";
import { useEffect, useState } from "react";

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/80 bg-card px-4 py-3.5">
      <div className="eyebrow truncate">{label}</div>
      <div className="mt-1 truncate text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1 truncate text-xs text-muted-foreground">{note}</div>
    </div>
  );
}

/** Indicators of Día a día: month total, daily average, biggest expense and today. */
export function DailyIndicators({
  expenses,
  month,
  year,
}: {
  expenses: DailyExpense[];
  month: number;
  year: number;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const summary = summarizeDaily(
    expenses,
    month,
    year,
    now ?? new Date(year, month - 1, 1),
  );
  const days = now ? elapsedDays(month, year, now) : 0;
  const biggest = summary.biggest;
  const count = `${summary.count} ${summary.count === 1 ? "gasto" : "gastos"}`;
  const average = summary.dailyAverage;
  return (
    <IndicatorsDisclosure
      ariaLabel="indicadores del mes"
      summary={`${formatPlatformTotals(summary.total)} · ${count}`}
    >
      <section
        className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicadores del mes"
      >
        <Metric
          label="Total del mes"
          value={formatPlatformTotals(summary.total)}
          note={`${count} · todos los medios`}
        />
        <Metric
          label="Promedio diario"
          value={formatCurrency(average)}
          note={
            days
              ? `${days} ${days === 1 ? "día transcurrido" : "días transcurridos"}`
              : "—"
          }
        />
        <Metric
          label="Mayor gasto"
          value={biggest?.description ?? "—"}
          note={
            biggest
              ? `${formatCurrency(biggest.amountInPen ?? biggest.amount)} · ${formatDayMonth(biggest.spentAt)}`
              : "Sin gastos"
          }
        />
        <Metric
          label="Hoy"
          value={formatCurrency(summary.today.total)}
          note={
            summary.today.count === 0
              ? "Sin gastos hoy"
              : `${summary.today.count} ${summary.today.count === 1 ? "gasto" : "gastos"} · ${
                  summary.today.total <= average ? "bajo" : "sobre"
                } el promedio`
          }
        />
      </section>
    </IndicatorsDisclosure>
  );
}
