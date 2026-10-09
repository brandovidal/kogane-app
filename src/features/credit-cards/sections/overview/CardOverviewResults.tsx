import { ArrowRight } from "lucide-react";
import type { CardOverviewRow } from "../../hooks/useCardOverview";
import { formatCurrency } from "@/shared/lib/currency";
import { EmptyState } from "@/shared/components/data-display/EmptyState";

function CardSwatch({ color }: { color: string | null }) {
  return (
    <span
      className="size-7 shrink-0 rounded-md"
      style={{ backgroundColor: color ?? "var(--muted)" }}
      aria-hidden="true"
    />
  );
}

export function CardOverviewResults({
  rows,
  layout,
  loading,
  error,
}: {
  rows: CardOverviewRow[];
  layout: "cards" | "table";
  loading: boolean;
  error: boolean;
}) {
  if (loading)
    return (
      <div className="credit-card-surface p-8 text-center text-sm text-muted-foreground">
        Cargando tarjetas…
      </div>
    );
  if (error)
    return (
      <p role="alert" className="py-8 text-center text-sm text-destructive">
        No se pudieron cargar las tarjetas.
      </p>
    );
  if (!rows.length)
    return (
      <EmptyState
        title="Aún no hay tarjetas"
        description="Agrega una tarjeta de crédito para ver sus movimientos aquí."
      />
    );
  if (layout === "table")
    return (
      <div className="credit-card-surface overflow-x-auto">
        <table className="w-full min-w-[650px] text-sm">
          <thead className="border-b bg-muted/20 text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Tarjeta</th>
              <th className="p-3 text-right font-medium">Total</th>
              <th className="p-3 text-right font-medium">Movimientos</th>
              <th className="p-3 text-right font-medium">Pendientes</th>
              <th className="p-3 font-medium">Cierre · pago</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.card.id}
                className="border-b last:border-0 hover:bg-muted/20"
              >
                <td className="p-3">
                  <span className="flex items-center gap-2">
                    <CardSwatch color={row.card.color} />
                    <span className="font-semibold">{row.card.name}</span>
                  </span>
                </td>
                <td className="p-3 text-right font-semibold tabular-nums">
                  {formatCurrency(row.total)}
                </td>
                <td className="p-3 text-right tabular-nums">{row.count}</td>
                <td className="p-3 text-right tabular-nums">
                  {row.pending ? formatCurrency(row.pending) : "—"}
                </td>
                <td className="p-3">
                  día {row.closeDay ?? "—"} · día {row.payDay ?? "—"}
                </td>
                <td className="p-3">
                  <a
                    href={row.href}
                    className="inline-flex items-center gap-1 hover:text-brand"
                  >
                    Ver detalle <ArrowRight className="size-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {rows.map((row) => (
        <a
          key={row.card.id}
          href={row.href}
          className="credit-card-surface card-overview-tile block p-4"
        >
          <div className="flex items-center gap-3">
            <CardSwatch color={row.card.color} />
            <span className="min-w-0 flex-1 truncate font-semibold">
              {row.card.name}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              Ver detalle <ArrowRight className="size-3.5" />
            </span>
          </div>
          <div className="mt-4 text-2xl font-semibold tabular-nums">
            {formatCurrency(row.total)}
          </div>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Movimientos</dt>
              <dd className="tabular-nums">{row.count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Pendientes</dt>
              <dd className="tabular-nums">
                {row.pending ? formatCurrency(row.pending) : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cierre · pago</dt>
              <dd>
                día {row.closeDay ?? "—"} · día {row.payDay ?? "—"}
              </dd>
            </div>
          </dl>
        </a>
      ))}
    </div>
  );
}
