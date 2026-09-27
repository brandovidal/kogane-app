import type { Category, FixedCost } from "@/shared/api/types";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { type ViewMode } from "@/shared/types/data-view";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { OwnPart } from "@/features/expenses/components/OwnPart";
import type {
  CatalogName,
  FixedCostGroupBy,
} from "@/features/fixed-costs/types/fixed-cost-types";
import { DataTableComplex } from "@/shared/components/data-display/DataTableComplex";
import { DataTablePagination } from "@/shared/components/data-display/DataTablePagination";
import type { useFixedCostTable } from "../hooks/useFixedCostTable";

export interface FixedCostResultsSectionProps {
  items: FixedCost[];
  totalRecords: number;
  categories: Category[];
  personName: CatalogName;
  view: ViewMode;
  groupBy: FixedCostGroupBy;
  totals: { paid: number; own: number };
  dataTable: ReturnType<typeof useFixedCostTable>;
  loading: boolean;
  error: boolean;
  pending: boolean;
}

export function FixedCostResultsSection({
  items,
  totalRecords,
  categories,
  personName,
  view,
  groupBy,
  totals,
  dataTable,
  loading,
  error,
  pending,
}: FixedCostResultsSectionProps) {
  const emptyMessage = totalRecords
    ? "No hay costos fijos con estos filtros"
    : "No hay costos fijos en este mes";
  const footer = (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {items.length} registros
      </span>
      <div className="text-right">
        <span className="text-sm font-semibold">
          Total: S/ {totals.paid.toFixed(2)}
        </span>
        <OwnPart {...totals} />
      </div>
    </div>
  );
  if (view === "table" && groupBy.length === 0)
    return (
      <DataTableComplex
        table={dataTable.table}
        footer={footer}
        loading={loading}
        error={error ? "No se pudieron cargar los costos fijos." : undefined}
        emptyMessage={emptyMessage}
      />
    );
  if (loading)
    return (
      <p
        role="status"
        className="py-8 text-center text-sm text-muted-foreground"
      >
        Cargando registros…
      </p>
    );
  if (error)
    return (
      <p role="alert" className="py-8 text-center text-sm text-destructive">
        No se pudieron cargar los costos fijos.
      </p>
    );
  if (!items.length) return <EmptyState description={emptyMessage} />;

  return (
    <div className="space-y-3">
      <GroupedDataView
        items={dataTable.table.getRowModel().rows.map((row) => row.original)}
        columns={dataTable.visibleColumns}
        rowKey={(cost) => cost.id}
        view={view}
        groupBy={groupBy}
        selected={dataTable.selected}
        onSelectedChange={dataTable.onSelectedChange}
        selectionDisabled={pending}
        groupKey={(cost, field) =>
          field === "person"
            ? (cost.personId ?? "none")
            : (cost.categoryId ?? "none")
        }
        groupLabel={(key, field) =>
          key === "none"
            ? "Sin asignar"
            : field === "person"
              ? personName(key)
              : (categories.find((category) => category.id === key)?.name ??
                "Sin categoría")
        }
        footer={footer}
      />
      <DataTablePagination table={dataTable.table} disabled={pending} />
    </div>
  );
}
