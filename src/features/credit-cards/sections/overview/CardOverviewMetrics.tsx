import type { CardOverviewRow } from "../../types/card-overview";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName, localTodayKey } from "@/shared/lib/dates";
import { IndicatorsDisclosure } from "@/shared/components/data-display/IndicatorsDisclosure";
import type { CreditCardExpense } from "@/shared/api/types";
import type { CardOverviewView } from "./CardOverviewViewBar";

function daysToPayment(day: number): number {
  const nowKey = localTodayKey();
  const [year, month, today] = nowKey.split("-").map(Number);
  const dueThisMonth = Math.min(day, new Date(year, month, 0).getDate());
  if (dueThisMonth >= today) return dueThisMonth - today;
  const dueNextMonth = Math.min(day, new Date(year, month + 1, 0).getDate());
  const currentDate = new Date(year, month - 1, today);
  return Math.round(
    (new Date(year, month, dueNextMonth).getTime() - currentDate.getTime()) /
      86_400_000,
  );
}

export function CardOverviewMetrics({
  rows,
  movements,
  total,
  loading,
  month,
  view = "summary",
  expenses = [],
}: {
  rows: CardOverviewRow[];
  movements: number;
  total: number;
  loading: boolean;
  month: number;
  view?: CardOverviewView;
  expenses?: CreditCardExpense[];
}) {
  if (view === "currency") {
    const soles = expenses.filter((expense) => expense.currency === "PEN");
    const dollars = expenses.filter((expense) => expense.currency === "USD");
    const totalPEN = soles.reduce((sum, expense) => sum + expense.amount, 0);
    const totalUSD = dollars.reduce((sum, expense) => sum + expense.amount, 0);
    const equivalentPEN = expenses.reduce((sum, expense) => {
      if (expense.currency === "PEN") return sum + expense.amount;
      const converted =
        expense.amountInPen ??
        (expense.exchangeRate ? expense.amount * expense.exchangeRate : 0);
      return sum + converted;
    }, 0);
    const largest = rows.reduce<CardOverviewRow | undefined>(
      (current, row) =>
        !current || row.pending > current.pending ? row : current,
      undefined,
    );
    const cardCount = (currency: string) =>
      new Set(
        expenses
          .filter((expense) => expense.currency === currency)
          .map((expense) => expense.paymentMethodId),
      ).size;
    return (
      <IndicatorsDisclosure
        ariaLabel="indicadores por moneda de tarjetas"
        defaultOpen={false}
        summary={`${formatCurrency(equivalentPEN)} · ${expenses.length} movimientos`}
        collapsedLabel="Expandir"
      >
        <section
          aria-label="Resumen por moneda"
          className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div className="credit-card-surface card-metric-active min-w-0 p-4">
            <div className="eyebrow">Total en soles</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {loading ? "—" : formatCurrency(totalPEN)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {soles.length} movimientos · {cardCount("PEN")} tarjetas
            </div>
          </div>
          <div className="credit-card-surface min-w-0 p-4">
            <div className="eyebrow">Total en dólares</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {loading ? "—" : formatCurrency(totalUSD, "USD")}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {dollars.length}{" "}
              {dollars.length === 1 ? "movimiento" : "movimientos"}
            </div>
          </div>
          <div className="credit-card-surface min-w-0 p-4">
            <div className="eyebrow">Equivalente en soles</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {loading ? "—" : formatCurrency(equivalentPEN)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Según el tipo de cambio guardado en cada movimiento
            </div>
          </div>
          <div className="credit-card-surface min-w-0 p-4">
            <div className="eyebrow">Mayor saldo pendiente</div>
            <div className="mt-1 truncate text-2xl font-semibold">
              {largest?.card.name ?? "—"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {largest
                ? formatCurrency(largest.pending)
                : "Sin saldos pendientes"}
            </div>
          </div>
        </section>
      </IndicatorsDisclosure>
    );
  }

  const upcoming = rows
    .filter((row) => row.pending > 0 && row.payDay)
    .sort((a, b) => daysToPayment(a.payDay!) - daysToPayment(b.payDay!));
  const totalPending = upcoming.reduce((sum, row) => sum + row.pending, 0);
  const maxPending = Math.max(...upcoming.map((row) => row.pending), 0);

  return (
    <IndicatorsDisclosure
      ariaLabel="indicadores de tarjetas"
      summary={
        loading
          ? "Cargando indicadores"
          : `${formatCurrency(total)} · ${rows.length} ${rows.length === 1 ? "tarjeta" : "tarjetas"}`
      }
    >
      <section
        className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,3fr)]"
        aria-label="Resumen de tarjetas"
      >
        <div className="credit-card-surface card-metric-active min-w-0 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow">Total tarjetas</span>
            <span className="text-xs font-medium text-brand">Mostrando</span>
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {loading ? "—" : formatCurrency(total)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {movements} movimientos · {rows.length} tarjetas
          </div>
        </div>
        <div className="credit-card-surface min-w-0 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="eyebrow">Próximos pagos</div>
            <p className="text-xs text-muted-foreground">
              Total a pagar este mes{" "}
              <strong className="text-foreground tabular-nums">
                {formatCurrency(totalPending)}
              </strong>
            </p>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.length ? (
              upcoming.map((row, index) => (
                <a
                  key={row.card.id}
                  href={row.href}
                  className={`card-upcoming-payment ${index > 0 ? "xl:border-l xl:pl-4" : ""}`}
                  aria-label={`${row.card.name}, pendiente ${formatCurrency(row.pending)}. Abrir para registrar pago`}
                >
                  <span className="flex items-center justify-between gap-2 text-sm">
                    <strong className="font-semibold">
                      {row.payDay}{" "}
                      {getMonthName(month).slice(0, 3).toLocaleLowerCase()}
                    </strong>
                    <span className="text-xs font-medium text-amber-400">
                      {daysToPayment(row.payDay!) === 0
                        ? "hoy"
                        : `en ${daysToPayment(row.payDay!)} días`}
                    </span>
                  </span>
                  <span className="mt-2 flex items-center gap-2 text-sm font-semibold">
                    <span
                      className="size-4 shrink-0 rounded"
                      style={{
                        backgroundColor: row.card.color ?? "var(--muted)",
                      }}
                      aria-hidden="true"
                    />
                    {row.card.name}
                  </span>
                  <strong className="mt-2 block text-2xl font-semibold tabular-nums">
                    {formatCurrency(row.pending)}
                  </strong>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted/70">
                    <span
                      className="block h-full rounded-full bg-brand"
                      style={{
                        width: `${maxPending ? Math.max(20, (row.pending / maxPending) * 100) : 0}%`,
                      }}
                    />
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      Cierre día {row.closeDay ?? "—"} · pago día {row.payDay}
                    </span>
                    <span className="shrink-0 font-medium text-brand">
                      Registrar pago
                    </span>
                  </span>
                </a>
              ))
            ) : (
              <span className="text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                Nada por pagar este mes
              </span>
            )}
          </div>
        </div>
      </section>
    </IndicatorsDisclosure>
  );
}
