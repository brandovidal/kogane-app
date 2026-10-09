import type { ReactNode } from "react";
import type { Statement } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName, localTodayKey } from "@/shared/lib/dates";
import { lineUsage } from "../../lib/card-summary";
import { SummaryCard } from "@/shared/components/data-display/SummaryCard";
import { IndicatorsDisclosure } from "@/shared/components/data-display/IndicatorsDisclosure";

function Metric({
  label,
  value,
  note,
  className,
  valueClassName,
}: {
  label: ReactNode;
  value: string;
  note?: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <SummaryCard
      label={label}
      value={value}
      detail={note ?? " "}
      className={`credit-card-surface min-w-0 p-4 ${className ?? ""}`}
      valueClassName={valueClassName}
      detailClassName="text-xs"
    />
  );
}

function daysUntil(date: string): number {
  const today = new Date(`${localTodayKey()}T00:00:00Z`);
  const due = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function CardDetailMetrics({
  view,
  month,
  year,
  amount,
  movementCount,
  categories,
  largestCategory,
  statement,
  closeDay,
  creditLimit,
}: {
  view: "summary" | "expenses" | "card-detail" | "payment";
  month: number;
  year: number;
  amount: number;
  movementCount: number;
  categories: number;
  largestCategory: string;
  statement?: Statement;
  closeDay?: number | null;
  creditLimit?: number | null;
}) {
  const balance =
    statement?.balances.find((item) => item.currency === "PEN") ??
    statement?.balances[0];
  const money = (value: number | null | undefined) =>
    value == null ? "—" : formatCurrency(value, balance?.currency ?? "PEN");
  const period = `${getMonthName(month)} ${year}`;
  if (view === "payment") return null;

  const dueNote = statement?.dueDate
    ? daysUntil(statement.dueDate) === 0
      ? `vence hoy · cierre día ${closeDay ?? "—"}`
      : daysUntil(statement.dueDate) > 0
        ? `en ${daysUntil(statement.dueDate)} días · cierre día ${closeDay ?? "—"}`
        : `venció hace ${Math.abs(daysUntil(statement.dueDate))} días · cierre día ${closeDay ?? "—"}`
    : closeDay
      ? `cierre día ${closeDay}`
      : period;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-400">
          <span
            className="size-2 rounded-full bg-emerald-400"
            aria-hidden="true"
          />
          {statement ? "Estado de cuenta cargado" : "Consumo registrado"} ·{" "}
          {period}
        </span>
        {balance?.totalDue != null && (
          <span className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-1 font-semibold tabular-nums">
            {formatCurrency(balance.totalDue, balance.currency)}
            <span className="text-[10px] font-medium text-muted-foreground">
              {balance.currency}
            </span>
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {statement?.dueDate
            ? `Vence ${formatDate(statement.dueDate)}`
            : "Sin fecha de vencimiento"}
        </span>
      </div>
      <IndicatorsDisclosure
        ariaLabel="indicadores de la tarjeta"
        summary={`${formatCurrency(amount)} · ${movementCount} movimientos`}
      >
        {view === "card-detail" ? (
          <div
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Indicadores de la tarjeta"
          >
            <Metric
              label="Consumo del ciclo"
              value={formatCurrency(amount)}
              note={period}
              className="card-metric-active"
            />
            <Metric
              label="Categorías"
              value={String(categories)}
              note="Con movimientos"
            />
            <Metric label="Mayor categoría" value={largestCategory} />
            <Metric
              label="Intereses y seguros"
              value={money(balance?.itemizedCharges)}
            />
          </div>
        ) : (
          <div
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Indicadores de la tarjeta"
          >
            <Metric
              label={
                <span className="flex items-center justify-between gap-2">
                  Consumo registrado
                  <span className="text-xs font-medium normal-case tracking-normal text-brand">
                    Mostrando
                  </span>
                </span>
              }
              value={formatCurrency(amount)}
              note={`${movementCount} ${movementCount === 1 ? "movimiento" : "movimientos"} · ${period}`}
              className="card-metric-active"
            />
            <Metric
              label="Pago mínimo"
              value={money(balance?.minimumDue)}
              note={
                balance?.minimumDue != null
                  ? amount >= balance.minimumDue
                    ? `Cubierto con excedente ${formatCurrency(amount - balance.minimumDue, balance.currency)}`
                    : `Faltan ${formatCurrency(balance.minimumDue - amount, balance.currency)} para cubrir el mínimo`
                  : undefined
              }
              valueClassName="text-emerald-400"
            />
            {view === "summary" ? (
              <Metric
                label="Línea usada"
                value={
                  lineUsage(amount, creditLimit) == null
                    ? "—"
                    : `${lineUsage(amount, creditLimit)}%`
                }
                note={
                  creditLimit
                    ? `${formatCurrency(amount)} de ${formatCurrency(creditLimit)}`
                    : "Sin línea de crédito"
                }
                valueClassName="text-amber-400"
              />
            ) : (
              <Metric
                label="Diferencia con el banco"
                value={money(balance?.difference)}
                note={
                  balance
                    ? `Banco ${money(balance.totalDue)} · registrado ${formatCurrency(amount)}`
                    : undefined
                }
                valueClassName="text-amber-400"
              />
            )}
            <Metric
              label="Vence"
              value={statement?.dueDate ? formatDate(statement.dueDate) : "—"}
              note={dueNote}
            />
          </div>
        )}
      </IndicatorsDisclosure>
    </div>
  );
}
