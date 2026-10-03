import { useMemo, useState } from "react";
import type { Category, FixedCost } from "@/shared/api/types";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { cn } from "@/shared/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { FixedCostDue } from "../../components/list/FixedCostDue";
import { installmentSeries } from "../../lib/fixed-cost-views";
import type { CatalogName } from "../../types/fixed-cost-types";
import { AttachmentRecordThumbnail } from "@/features/attachments/components/AttachmentRecordThumbnail";

const monthLabel = (index: number) =>
  `${getMonthName((index % 12) + 1).slice(0, 3)} ${Math.floor(index / 12)}`;

/** "Cuotas" view: one row per debt with its progress, what is left and when it ends. */
export function FixedCostInstallmentsView({
  items,
  categories,
  personName,
  loading,
  onOpen,
}: {
  items: FixedCost[];
  categories: Category[];
  personName: CatalogName;
  loading: boolean;
  onOpen: (cost: FixedCost) => void;
}) {
  const [status, setStatus] = useState<"active" | "done">("active");
  const series = useMemo(() => installmentSeries(items), [items]);
  const shown = series.filter((item) => (status === "active" ? item.remaining > 0 : item.remaining === 0));
  const active = series.filter((item) => item.remaining > 0);
  const monthly = active.reduce((sum, item) => sum + (item.latest.amountInPen ?? item.latest.amount), 0);
  const balance = active.reduce((sum, item) => sum + item.estimatedBalance, 0);
  const nextToEnd = active[0];

  const card = (label: string, value: string, detail: string) => (
    <div className="min-w-0 rounded-2xl border bg-card px-4 py-3.5">
      <div className="eyebrow">{label}</div>
      <div className="mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1.5 text-xs text-muted-foreground">{detail}</div>
    </div>
  );

  if (loading)
    return (
      <p role="status" className="py-8 text-center text-sm text-muted-foreground">
        Cargando cuotas…
      </p>
    );

  return (
    <div className="space-y-4">
      <section aria-label="Resumen de cuotas" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {card("Cuotas activas", String(active.length), active.map((item) => item.latest.description).slice(0, 3).join(" · ") || "Sin deudas en cuotas")}
        {card("Pago mensual en cuotas", formatCurrency(monthly), "Se repite cada mes")}
        {card("Saldo pendiente ≈", formatCurrency(balance), "Cuotas que faltan × cuota, sin intereses")}
        {card(
          "Próxima en terminar",
          nextToEnd ? `${nextToEnd.latest.description} · ${monthLabel(nextToEnd.endIndex)}` : "—",
          nextToEnd ? `${nextToEnd.remaining} ${nextToEnd.remaining === 1 ? "cuota" : "cuotas"} por pagar` : "No hay cuotas activas",
        )}
      </section>

      <div className="flex items-center justify-between gap-2">
        <div role="radiogroup" aria-label="Estado de la deuda" className="flex gap-0.5 rounded-lg border p-0.5">
          {(
            [
              ["active", `Activas ${active.length}`],
              ["done", `Terminadas ${series.length - active.length}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={status === value}
              onClick={() => setStatus(value)}
              className={cn(
                "h-7 rounded-md px-3 text-sm text-muted-foreground transition-colors",
                status === value && "bg-accent text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Una cuota sin pagar en el último mes cuenta como pendiente.
        </p>
      </div>

      {!shown.length ? (
        <EmptyState
          description={status === "active" ? "No hay deudas en cuotas activas." : "Aún no terminaste ninguna deuda en cuotas."}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deuda</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Cuota</TableHead>
                <TableHead className="w-56">Avance</TableHead>
                <TableHead className="text-right">Pagadas</TableHead>
                <TableHead className="text-right">Faltan</TableHead>
                <TableHead>Termina</TableHead>
                <TableHead className="text-right">Saldo ≈</TableHead>
                <TableHead>Último vencimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((item) => {
                const category = categories.find((entry) => entry.id === item.latest.categoryId);
                return (
                  <TableRow key={item.key}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AttachmentRecordThumbnail refType="fixed_cost" refId={item.latest.id} label={item.latest.description} />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onOpen(item.latest)}
                            className="truncate font-medium hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {item.latest.description}
                          </button>
                          <div className="text-xs text-muted-foreground">{personName(item.latest.personId)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category ? <CategoryLabel name={category.name} icon={category.icon} color={category.color} className="text-sm" /> : "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(item.latest.amountInPen ?? item.latest.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5 pr-4">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <span className="block h-full rounded-full bg-brand" style={{ width: `${item.percent}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                          <span>
                            Cuota {item.current} de {item.total}
                          </span>
                          <span>{item.percent}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{item.paid}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.remaining}</TableCell>
                    <TableCell className="tabular-nums">{monthLabel(item.endIndex)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(item.estimatedBalance)}</TableCell>
                    <TableCell>
                      <FixedCostDue cost={item.latest} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            {status === "active" && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="text-xs uppercase tracking-wider text-muted-foreground">
                    {shown.length} {shown.length === 1 ? "deuda" : "deudas"}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(monthly)}</TableCell>
                  <TableCell colSpan={4} />
                  <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(balance)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      )}
    </div>
  );
}
