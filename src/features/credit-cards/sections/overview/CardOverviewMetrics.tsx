import type { CardOverviewRow } from "../../hooks/useCardOverview";
import { formatCurrency } from "@/shared/lib/currency";
import { localTodayKey } from "@/features/fixed-costs/lib/fixed-cost-views";

function daysToPayment(day: number): number {
  const nowKey = localTodayKey();
  const [year, month, today] = nowKey.split("-").map(Number);
  const dueThisMonth = Math.min(day, new Date(year, month, 0).getDate());
  if (dueThisMonth >= today) return dueThisMonth - today;
  const dueNextMonth = Math.min(day, new Date(year, month + 1, 0).getDate());
  const currentDate = new Date(year, month - 1, today);
  return Math.round((new Date(year, month, dueNextMonth).getTime() - currentDate.getTime()) / 86_400_000);
}

export function CardOverviewMetrics({ rows, movements, total, loading }: { rows: CardOverviewRow[]; movements: number; total: number; loading: boolean }) {
  const upcoming = rows.filter((row) => row.pending > 0 && row.payDay).sort((a, b) => daysToPayment(a.payDay!) - daysToPayment(b.payDay!));
  return <section className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,3fr)]" aria-label="Resumen de tarjetas">
    <div className="credit-card-surface card-metric-active min-w-0 p-4"><div className="flex items-center justify-between gap-2"><span className="eyebrow">Total tarjetas</span><span className="text-xs font-medium text-brand">Mostrando</span></div><div className="mt-1 text-2xl font-semibold tabular-nums">{loading ? "—" : formatCurrency(total)}</div><div className="mt-1 text-xs text-muted-foreground">{movements} movimientos · {rows.length} tarjetas</div></div>
    <div className="credit-card-surface min-w-0 p-4"><div className="eyebrow">Próximos pagos</div><div className="mt-3 flex flex-wrap gap-2">{upcoming.length ? upcoming.map((row, index) => <a key={row.card.id} href={row.href} className={index === 0 ? "card-payment-chip card-payment-chip-first" : "card-payment-chip"}><span>Día {row.payDay}</span><span>{row.card.name}</span><strong className="tabular-nums">{formatCurrency(row.pending)}</strong><span className="text-amber-500">{daysToPayment(row.payDay!) === 0 ? "hoy" : `en ${daysToPayment(row.payDay!)} días`}</span></a>) : <span className="text-sm text-muted-foreground">Nada por pagar este mes</span>}</div><p className="mt-3 text-xs text-muted-foreground">Total a pagar este mes: <strong className="text-foreground tabular-nums">{formatCurrency(upcoming.reduce((sum, row) => sum + row.pending, 0))}</strong></p></div>
  </section>;
}
