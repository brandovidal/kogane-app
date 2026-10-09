import { ArrowRight } from "lucide-react";
import type { CardOverviewRow } from "../../types/card-overview";
import { formatCurrency } from "@/shared/lib/currency";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { DataView } from "@/shared/components/data-display/DataView";
import { DataLoadingSkeleton } from "@/shared/components/data-display/DataLoadingSkeleton";
import type { Column } from "@/shared/types/data-view";

function CardSwatch({ color }: { color: string | null }) {
  return (
    <span
      className="h-7 w-10 shrink-0 rounded-md"
      style={{ backgroundColor: color ?? "var(--muted)" }}
      aria-hidden="true"
    />
  );
}

function CardOverviewTile({ row }: { row: CardOverviewRow }) {
  return (
    <a
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
  );
}

export function CardOverviewResults({
  rows,
  layout,
  groupBy = "none",
  loading,
  error,
}: {
  rows: CardOverviewRow[];
  layout: "cards" | "table";
  groupBy?: "none" | "bank";
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
      className: "w-32",
      cell: (row) => (
        <a
          href={row.href}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Ver detalle <ArrowRight className="size-4" />
        </a>
      ),
    },
  ];
  const groups =
    groupBy === "bank"
      ? Array.from(
          rows.reduce((map, row) => {
            const label = row.card.bank?.trim() || "Sin banco";
            map.set(label, [...(map.get(label) ?? []), row]);
            return map;
          }, new Map<string, CardOverviewRow[]>()),
        )
      : [];
  const renderView = (items: CardOverviewRow[]) => (
    <DataView
      items={items}
      columns={columns}
      rowKey={(row) => row.card.id}
      view={layout}
      tableClassName="credit-card-surface"
      cardRenderer={(row) => <CardOverviewTile row={row} />}
    />
  );

  if (groupBy === "none") return renderView(rows);
  return (
    <div className="space-y-5">
      {groups.map(([label, items]) => (
        <section key={label} aria-label={`Tarjetas de ${label}`}>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            {label}
            <span className="text-xs font-normal text-muted-foreground">
              {items.length}
            </span>
          </h2>
          {renderView(items)}
        </section>
      ))}
    </div>
  );
}
