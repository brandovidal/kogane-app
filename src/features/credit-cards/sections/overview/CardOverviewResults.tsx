import { ArrowRight } from "lucide-react";
import {
  CardActionsMenu,
  type CardActions,
} from "../../components/CardActionsMenu";
import type { CardOverviewRow } from "../../types/card-overview";
import { formatCurrency } from "@/shared/lib/currency";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { DataView } from "@/shared/components/data-display/DataView";
import { DataLoadingSkeleton } from "@/shared/components/data-display/DataLoadingSkeleton";
import type { Column } from "@/shared/types/data-view";
import type { CardOverviewGroupBy } from "../../constants/filters";

function CardSwatch({ color }: { color: string | null }) {
  return (
    <span
      className="h-7 w-10 shrink-0 rounded-md"
      style={{ backgroundColor: color ?? "var(--muted)" }}
      aria-hidden="true"
    />
  );
}

function CardOverviewTile({
  row,
  actions,
}: {
  row: CardOverviewRow;
  actions: CardActions;
}) {
  return (
    <div className="relative">
      <a
        href={row.href}
        className="credit-card-surface card-overview-tile block p-4"
      >
        <div className="flex items-center gap-3 pr-10">
          <CardSwatch color={row.card.color} />
          <span className="min-w-0 flex-1 truncate font-semibold">
            {row.card.name}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            Ver detalle <ArrowRight className="size-3.5" />
          </span>
        </div>
        <div className="mt-4 text-3xl font-semibold tabular-nums">
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
      <div className="absolute right-2 top-3">
        <CardActionsMenu row={row} actions={actions} />
      </div>
    </div>
  );
}

export function CardOverviewResults({
  rows,
  layout,
  groupBy = [],
  personName,
  loading,
  error,
  actions,
}: {
  actions: CardActions;
  rows: CardOverviewRow[];
  layout: "cards" | "table";
  groupBy?: CardOverviewGroupBy[];
  personName: (id: string | null | undefined) => string;
  loading: boolean;
  error: boolean;
}) {
  if (error)
    return (
      <p role="alert" className="py-8 text-center text-sm text-destructive">
        No se pudieron cargar las tarjetas.
      </p>
    );
  if (!rows.length && !loading)
    return (
      <EmptyState
        title="Aún no hay tarjetas"
        description="Agrega una tarjeta de crédito para ver sus movimientos aquí."
      />
    );
  if (loading && !rows.length)
    return (
      <DataLoadingSkeleton variant={layout === "cards" ? "cards" : "table"} />
    );

  const columns: Column<CardOverviewRow>[] = [
    {
      key: "card",
      header: "Tarjeta",
      role: "title",
      accessor: (row) => row.card.name,
      cell: (row) => (
        <a href={row.href} className="flex items-center gap-2 font-semibold">
          <CardSwatch color={row.card.color} />
          {row.card.name}
        </a>
      ),
    },
    {
      key: "pending",
      header: "Pendiente",
      role: "amount",
      accessor: (row) => row.pending,
      cell: (row) => (
        <span className="font-semibold tabular-nums">
          {row.pending ? formatCurrency(row.pending) : "—"}
        </span>
      ),
    },
    {
      key: "movements",
      header: "Movimientos",
      accessor: (row) => row.count,
      cell: (row) => <span className="tabular-nums">{row.count}</span>,
    },
    {
      key: "cycle",
      header: "Cierre · pago",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          día {row.closeDay ?? "—"} · día {row.payDay ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-40",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <a
            href={row.href}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Ver detalle <ArrowRight className="size-4" />
          </a>
          <CardActionsMenu row={row} actions={actions} />
        </div>
      ),
    },
  ];
  const groupKey = (row: CardOverviewRow, field: CardOverviewGroupBy) => {
    if (field === "bank") return row.card.bank?.trim() || "none";
    if (field === "currency") return row.card.currency || "PEN";
    if (field === "person")
      return (
        row.expenses.find((expense) => expense.personId)?.personId ?? "none"
      );
    return row.expenses.some((expense) => expense.installment)
      ? "installments"
      : "without-installments";
  };
  const groupLabel = (key: string, field: CardOverviewGroupBy) => {
    if (key === "none") return field === "bank" ? "Sin banco" : "Sin asignar";
    if (field === "currency")
      return key === "USD" ? "Dólares (USD)" : "Soles (PEN)";
    if (field === "installments")
      return key === "installments" ? "Con cuotas" : "Sin cuotas";
    if (field === "person") return personName(key);
    return key;
  };
  const renderGrouped = (items: CardOverviewRow[], depth = 0) => {
    if (depth >= groupBy.length) return renderView(items);
    const field = groupBy[depth];
    const grouped = new Map<string, CardOverviewRow[]>();
    items.forEach((row) => {
      const key = groupKey(row, field);
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    });
    return (
      <div className="space-y-4">
        {[...grouped.entries()].map(([key, groupRows]) => (
          <section key={`${field}:${key}`} aria-label={groupLabel(key, field)}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              {groupLabel(key, field)}
              <span className="text-xs font-normal text-muted-foreground">
                {groupRows.length}
              </span>
              <span className="ml-auto text-sm font-semibold tabular-nums">
                {formatCurrency(
                  groupRows.reduce((sum, row) => sum + row.total, 0),
                )}
              </span>
            </h2>
            {renderGrouped(groupRows, depth + 1)}
          </section>
        ))}
      </div>
    );
  };
  const renderView = (items: CardOverviewRow[]) => (
    <DataView
      items={items}
      columns={columns}
      rowKey={(row) => row.card.id}
      view={layout}
      tableClassName="credit-card-surface"
      cardRenderer={(row) => <CardOverviewTile row={row} actions={actions} />}
    />
  );

  return groupBy.length ? renderGrouped(rows) : renderView(rows);
}
