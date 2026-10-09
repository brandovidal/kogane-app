import type { CardOverviewRow } from "../../types/card-overview";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName, localTodayKey } from "@/shared/lib/dates";
import { IndicatorsDisclosure } from "@/shared/components/data-display/IndicatorsDisclosure";

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
}: {
  rows: CardOverviewRow[];
  movements: number;
  total: number;
  loading: boolean;
  month: number;
}) {
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
