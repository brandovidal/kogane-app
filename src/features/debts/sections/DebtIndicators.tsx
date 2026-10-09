import type { Debt } from "@/shared/api/types";
import { formatPlatformTotals } from "@/features/subscriptions/lib/platform-summary";
import { IndicatorsDisclosure } from "@/shared/components/data-display/IndicatorsDisclosure";
import { formatCurrency } from "@/shared/lib/currency";
import { summarizeDebts } from "../lib/debt-summary";
import type { Direction } from "../lib/debt-filters";

const WORDS: Record<
  Direction,
  { open: string; done: string; item: string; items: string }
> = {
  owed_to_me: {
    open: "Por cobrar",
    done: "Cobrado",
    item: "cuota",
    items: "cuotas",
  },
  i_owe: {
    open: "Por pagar",
    done: "Pagado",
    item: "deuda",
    items: "deudas",
  },
};

function Metric({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/80 bg-card px-4 py-3.5">
      <div className="eyebrow truncate">{label}</div>
      <div
        className={`mt-1 truncate text-2xl font-semibold tracking-tight tabular-nums ${tone ?? ""}`}
      >
        {value}
      </div>
      <div className="mt-1 truncate text-xs text-muted-foreground">{note}</div>
    </div>
  );
}

/** Indicators of the month: what is left, what is paid, what is late and the biggest balance. */
export function DebtIndicators({
  debts,
  direction,
}: {
  debts: Debt[];
  direction: Direction;
}) {
  const words = WORDS[direction];
  const summary = summarizeDebts(debts);
  const count = `${summary.count} ${summary.count === 1 ? words.item : words.items}`;
  const largest = summary.largest;
  return (
    <IndicatorsDisclosure
      ariaLabel="indicadores del mes"
      summary={`${formatPlatformTotals(summary.balance)} · ${count}`}
    >
      <section
        className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicadores del mes"
      >
        <Metric
          label={words.open}
          value={formatPlatformTotals(summary.balance)}
          note={`${count} · ${words.done.toLowerCase()} ${formatPlatformTotals(summary.paid)}`}
        />
        <Metric
          label={words.done}
          value={formatPlatformTotals(summary.paid)}
          note={summary.count ? `${summary.paidPercent}% del mes` : "—"}
          tone="text-emerald-400"
        />
        <Metric
          label="Retrasado"
          value={formatPlatformTotals(summary.late)}
          note={
            summary.lateCount
              ? `${summary.lateCount} ${summary.lateCount === 1 ? words.item : words.items} retrasada${summary.lateCount === 1 ? "" : "s"}`
              : `Sin ${words.items} retrasadas`
          }
          tone={summary.lateCount ? "text-red-400" : undefined}
        />
        <Metric
          label="Mayor saldo"
          value={largest?.debt.description ?? "—"}
          note={
            largest
              ? `${formatCurrency(largest.debt.balance, largest.debt.currency)}${largest.debt.installment ? ` · ${largest.debt.installment}` : ""} · ${largest.sharePercent}% del total`
              : "Sin saldos"
          }
        />
      </section>
    </IndicatorsDisclosure>
  );
}
