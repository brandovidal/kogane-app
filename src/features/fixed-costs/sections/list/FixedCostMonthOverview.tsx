import { useEffect, useState } from "react";
import type { FixedCost } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/utils/cn";
import {
  daysUntilDue,
  summarizeFixedCosts,
  type FixedCostStatusScope,
} from "../../lib/fixed-cost-summary";
import { localTodayKey } from "../../lib/fixed-cost-views";

function dueLabel(days: number | null) {
  if (days == null) return "Fecha por confirmar";
  if (days < 0) return `Venció hace ${Math.abs(days)} ${Math.abs(days) === 1 ? "día" : "días"}`;
  if (days === 0) return "Vence hoy";
  return `Vence en ${days} ${days === 1 ? "día" : "días"}`;
}

export function FixedCostMonthOverview({
  items,
  scope,
  onScopeChange,
  periodLabel = "del mes",
  loading = false,
}: {
  items: FixedCost[];
  scope: FixedCostStatusScope;
  onScopeChange: (scope: FixedCostStatusScope) => void;
  /** "del mes", "del año", "del período"… used in the first card. */
  periodLabel?: string;
  loading?: boolean;
}) {
  const [todayKey, setTodayKey] = useState("");
  useEffect(() => setTodayKey(localTodayKey()), []);
  if (loading)
    return (
      <section aria-label="Resumen del período" aria-busy="true" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-2xl border bg-card px-4 py-3.5">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </section>
    );
  const summary = summarizeFixedCosts(items);
  const dueDate = summary.nextDue?.dueDate;
  const days = dueDate && todayKey ? daysUntilDue(dueDate, todayKey) : null;
  const dueDisplay = dueDate
    ? new Date(`${dueDate.slice(0, 10)}T12:00:00`).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" })
    : null;

  const metric = (
    key: FixedCostStatusScope,
    label: string,
    amount: number,
    detail: React.ReactNode,
    amountClass?: string,
  ) => (
    <button
      type="button"
      key={key}
      aria-pressed={scope === key}
      onClick={() => onScopeChange(key)}
      className={cn(
        "min-w-0 rounded-2xl border bg-card px-4 py-3.5 text-left transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        scope === key && "border-brand/50 ring-[3px] ring-brand/15",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {scope === key && <span className="text-xs font-medium text-brand">Mostrando</span>}
      </div>
      <div className={cn("mt-1.5 text-2xl font-semibold tracking-tight tabular-nums", amountClass)}>{formatCurrency(amount)}</div>
      <div className="mt-1.5 text-xs text-muted-foreground">{detail}</div>
    </button>
  );

  return (
    <section aria-label="Resumen del período" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {metric("all", `Total ${periodLabel}`, summary.total, `${summary.totalCount} costos · todos los estados`)}
      {metric(
        "payable",
        "Por pagar",
        summary.payable,
        <span>Por iniciar {summary.notStartedCount} · En curso {summary.inProgressCount}</span>,
        summary.payableCount ? "text-amber-600 dark:text-amber-300" : undefined,
      )}
      {metric(
        "completed",
        "Completado",
        summary.completed,
        <>
          <span className="mb-1 block h-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-emerald-500 dark:bg-emerald-300"
              style={{ width: `${summary.totalCount ? (summary.completedCount / summary.totalCount) * 100 : 0}%` }}
            />
          </span>
          {summary.completedCount} de {summary.totalCount}
          {summary.totalCount > 0 && summary.completedCount === summary.totalCount ? " · todo al día" : " · pagado, abonado o exonerado"}
        </>,
        summary.completedCount ? "text-emerald-600 dark:text-emerald-300" : undefined,
      )}
      <div className="min-w-0 rounded-2xl border bg-card px-4 py-3.5">
        <div className="eyebrow">Próximo vencimiento</div>
        <div className="mt-1.5 truncate text-xl font-semibold tracking-tight">
          {summary.nextDue ? `${summary.nextDue.description} · ${dueDisplay}` : "Sin pendientes"}
        </div>
        <div className={cn("mt-1.5 text-xs", summary.nextDue ? "text-amber-600 dark:text-amber-300" : "text-muted-foreground")}>
          {summary.nextDue
            ? `${dueLabel(days)} · ${formatCurrency(summary.nextDue.amountInPen ?? summary.nextDue.amount)}`
            : "Todo pagado en este período"}
        </div>
      </div>
    </section>
  );
}
