import { useEffect, useState } from "react";
import type { FixedCost } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/utils/cn";
import {
  daysUntilDue,
  summarizeFixedCosts,
  type FixedCostStatusScope,
} from "../../lib/fixed-cost-summary";

function localTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

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
}: {
  items: FixedCost[];
  scope: FixedCostStatusScope;
  onScopeChange: (scope: FixedCostStatusScope) => void;
}) {
  const [todayKey, setTodayKey] = useState("");
  useEffect(() => setTodayKey(localTodayKey()), []);
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
        "min-w-0 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        scope === key && "border-primary ring-1 ring-primary/50",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{label}</span>
        {scope === key && <span className="font-medium text-primary">Mostrando</span>}
      </div>
      <div className={cn("mt-1 text-xl font-semibold tabular-nums", amountClass)}>{formatCurrency(amount)}</div>
      <div className="mt-1.5 text-xs text-muted-foreground">{detail}</div>
    </button>
  );

  return (
    <section aria-label="Resumen del mes" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {metric("all", "Total del mes", summary.total, `${summary.totalCount} costos · todos los estados`)}
      {metric(
        "payable",
        "Por pagar",
        summary.payable,
        <span>Por iniciar {summary.notStartedCount} · En curso {summary.inProgressCount}</span>,
        summary.payableCount ? "text-amber-500" : undefined,
      )}
      {metric(
        "completed",
        "Completado",
        summary.completed,
        <>
          <span className="mb-1 block h-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-emerald-500"
              style={{ width: `${summary.totalCount ? (summary.completedCount / summary.totalCount) * 100 : 0}%` }}
            />
          </span>
          {summary.completedCount} de {summary.totalCount} · todo al día
        </>,
        summary.completedCount ? "text-emerald-500" : undefined,
      )}
      <div className="min-w-0 rounded-xl border bg-card px-4 py-3">
        <div className="text-xs text-muted-foreground">Próximo vencimiento</div>
        <div className="mt-1 truncate text-lg font-semibold">
          {summary.nextDue ? `${summary.nextDue.description} · ${dueDisplay}` : "Sin pendientes"}
        </div>
        <div className={cn("mt-1.5 text-xs", summary.nextDue ? "text-amber-500" : "text-muted-foreground")}>
          {summary.nextDue
            ? `${dueLabel(days)} · ${formatCurrency(summary.nextDue.amountInPen ?? summary.nextDue.amount)}`
            : "Todo pagado este mes"}
        </div>
      </div>
    </section>
  );
}
