import type { DailyExpense } from "@/shared/api/types";
import { formatPlatformTotals } from "@/features/subscriptions/lib/platform-summary";
import { IndicatorsDisclosure } from "@/shared/components/data-display/IndicatorsDisclosure";
import { IndicatorsCollapsedSummary } from "@/shared/components/data-display/IndicatorsCollapsedSummary";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDayMonth } from "@/shared/lib/dates";
import { elapsedDays, summarizeDaily } from "../lib/daily-summary";
import { useEffect, useState } from "react";

function Metric({ label, value, note, selected = false }: { label: string; value: string; note: string; selected?: boolean }) {
  return (
    <div
      className={`min-w-0 rounded-xl border px-4 py-3.5 ${selected ? "border-brand/50 bg-brand/10 ring-2 ring-brand/15 dark:bg-indigo-300/10" : "border-border/80 bg-card"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="eyebrow truncate">{label}</div>
        {selected && <span className="shrink-0 text-xs font-medium text-brand">Mostrando</span>}
      </div>
      <div className="mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1.5 truncate text-xs text-muted-foreground">{note}</div>
    </div>
  );
}

/** Indicators of Día a día: month total, daily average, biggest expense and today. */
export function DailyIndicators({
  expenses,
  month,
  year,
  filtered = false,
}: {
  expenses: DailyExpense[];
  month: number;
  year: number;
  filtered?: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const summary = summarizeDaily(expenses, month, year, now ?? new Date(year, month - 1, 1));
  const days = now ? elapsedDays(month, year, now) : 0;
  const biggest = summary.biggest;
  const count = `${summary.count} ${summary.count === 1 ? "gasto" : "gastos"}`;
  const average = summary.dailyAverage;
  const summaryLabel = `${formatPlatformTotals(summary.total)} · ${count}`;
  const metrics = [
    { label: "Total del mes", value: formatPlatformTotals(summary.total) },
    { label: "Promedio diario", value: formatCurrency(average) },
    {
      label: "Mayor gasto",
      value: biggest?.description ?? "—",
    },
    { label: "Hoy", value: formatCurrency(summary.today.total) },
  ];
  return (
    <IndicatorsDisclosure
      ariaLabel="indicadores del mes"
      summary={summaryLabel}
      collapsedLabel="Expandir"
      collapsedContent={<IndicatorsCollapsedSummary summary={summaryLabel} metrics={metrics} />}
    >
      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores del mes">
        <Metric
          label="Total del mes"
          value={formatPlatformTotals(summary.total)}
          note={`${count} · ${filtered ? "filtrados" : "todos los medios"}`}
          selected
        />
        <Metric
          label="Promedio diario"
          value={formatCurrency(average)}
          note={days ? `${days} ${days === 1 ? "día transcurrido" : "días transcurridos"}` : "—"}
        />
        <Metric
          label="Mayor gasto"
          value={biggest?.description ?? "—"}
          note={biggest ? `${formatCurrency(biggest.amountInPen ?? biggest.amount)} · ${formatDayMonth(biggest.spentAt)}` : "Sin gastos"}
        />
        <Metric
          label="Hoy"
          value={formatCurrency(summary.today.total)}
          note={
            summary.today.count === 0
              ? "Sin gastos hoy"
              : `${summary.today.count} ${summary.today.count === 1 ? "gasto" : "gastos"} · ${summary.today.total <= average ? "bajo" : "sobre"} el promedio`
          }
        />
      </section>
    </IndicatorsDisclosure>
  );
}
