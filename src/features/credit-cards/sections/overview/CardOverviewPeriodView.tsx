import { Plus } from "lucide-react";
import type { CardOverviewRow } from "../../hooks/useCardOverview";
import { formatCurrency } from "@/shared/lib/currency";
import { DataLoadingSkeleton } from "@/shared/components/data-display/DataLoadingSkeleton";

const PERIODS = [
  { key: "early", label: "Cierre del 1 al 10", from: 1, to: 10 },
  { key: "middle", label: "Cierre del 11 al 20", from: 11, to: 20 },
  { key: "late", label: "Cierre del 21 al 31", from: 21, to: 31 },
] as const;

function CardSwatch({ color }: { color: string | null }) {
  return <span className="size-8 shrink-0 rounded-lg" style={{ backgroundColor: color ?? "var(--muted)" }} aria-hidden="true" />;
}

export function CardOverviewPeriodView({ rows, onNewCard, loading, error }: { rows: CardOverviewRow[]; onNewCard: () => void; loading: boolean; error: boolean }) {
  if (loading) return <DataLoadingSkeleton variant="cards" />;
  if (error) return <p role="alert" className="py-8 text-center text-sm text-destructive">No se pudieron cargar las tarjetas.</p>;

  const periods: { key: string; label: string; rows: CardOverviewRow[] }[] = PERIODS.map((period) => ({
    ...period,
    rows: rows.filter((row) => row.closeDay != null && row.closeDay >= period.from && row.closeDay <= period.to),
  }));
  const withoutCloseDay = rows.filter((row) => row.closeDay == null || row.closeDay < 1 || row.closeDay > 31);
  if (withoutCloseDay.length) periods.push({ key: "unset", label: "Sin día de cierre", from: 0, to: 0, rows: withoutCloseDay });

  return <div className="grid gap-3 lg:grid-cols-3 2xl:grid-cols-4">
    {periods.map((period) => {
      const total = period.rows.reduce((sum, row) => sum + row.total, 0);
      const pending = period.rows.reduce((sum, row) => sum + row.pending, 0);
      return <section key={period.key} className="credit-card-surface min-h-56 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold"><span className="size-2 shrink-0 rounded-full bg-indigo-300" />{period.label}<span className="text-xs font-normal text-muted-foreground">{period.rows.length}</span></h2>
          <span className="shrink-0 text-sm font-semibold tabular-nums">{formatCurrency(total)}</span>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{formatCurrency(pending)} pendiente</p>
        <div className="mt-3 space-y-2">
          {period.rows.map((row) => <a key={row.card.id} href={row.href} className="credit-card-surface card-overview-tile block p-3">
            <div className="flex items-center gap-2"><CardSwatch color={row.card.color} /><span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.card.name}</span><span className="shrink-0 text-sm font-semibold tabular-nums">{formatCurrency(row.total)}</span></div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>Cierre día {row.closeDay ?? "—"} · pago día {row.payDay ?? "—"}</span><span>{row.count} {row.count === 1 ? "movimiento" : "movimientos"}</span></div>
            <div className="mt-1 text-right text-xs">Pendiente: <span className="font-medium text-foreground tabular-nums">{formatCurrency(row.pending)}</span></div>
          </a>)}
          {!period.rows.length && <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Sin tarjetas en este periodo.</p>}
        </div>
        <button type="button" onClick={onNewCard} className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><Plus className="size-4" />Nueva tarjeta</button>
      </section>;
    })}
  </div>;
}
