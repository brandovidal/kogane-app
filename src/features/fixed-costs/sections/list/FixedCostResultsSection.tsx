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
import { formatCurrency } from "@/shared/lib/currency";
import { totalsOf } from "@/features/expenses/lib/shared-expense";
import type { useFixedCostTable } from "../../hooks/useFixedCostTable";
import { FixedCostCard } from "../../components/list/FixedCostCard";

export interface FixedCostResultsSectionProps {
  items: FixedCost[];
  totalRecords: number;
  categories: Category[];
  personName: CatalogName;
  view: ViewMode;
  groupBy: FixedCostGroupBy;
  dataTable: ReturnType<typeof useFixedCostTable>;
  loading: boolean;
  error: boolean;
  pending: boolean;
  /** Extra grouping set by the view (urgency in "Por pagar", month in "Todos"), before the user's groups. */
  viewGroup?: {
    field: string;
    key: (cost: FixedCost) => string;
    label: (key: string) => string;
  };
  emptyDescription?: string;
}

export function FixedCostResultsSection({
  items,
  totalRecords,
  categories,
  personName,
  view,
  groupBy,
  dataTable,
  loading,
  error,
  pending,
  viewGroup,
  emptyDescription,
}: FixedCostResultsSectionProps) {
  const emptyMessage =
    emptyDescription ??
    (totalRecords ? "No hay costos fijos con estos filtros" : "No hay costos fijos en este período");
  const fields = viewGroup ? [viewGroup.field, ...groupBy] : groupBy;
  const summaryFor = (records: FixedCost[]) => {
    const subtotal = totalsOf(records);
    return {
      label: (
        <div className="whitespace-nowrap text-right text-sm font-semibold">
          Total: {formatCurrency(subtotal.paid)}
          <OwnPart {...subtotal} />
        </div>
      ),
    };
  };
  if (view === "table" && fields.length === 0)
    return (
      <DataTableComplex
        table={dataTable.table}
        className="fixed-costs-table"
        calculationStorageKey="fixed-costs"
        calculationDefaults={{ description: "count", amount: "sum" }}
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
        groupBy={fields}
        primaryGroupDepth={viewGroup && groupBy.length ? 1 : 0}
        compactCards
        cardRenderer={(cost) => (
          <FixedCostCard
            cost={cost}
            columns={dataTable.visibleColumns}
            selected={dataTable.selected.has(cost.id)}
            onSelectedChange={(checked) => {
              const next = new Set(dataTable.selected);
              if (checked) next.add(cost.id);
              else next.delete(cost.id);
              dataTable.onSelectedChange(next);
            }}
            selectionDisabled={pending}
          />
        )}
        summaryForGroup={summaryFor}
        calculationStorageKey="fixed-costs"
        calculationDefaults={{ description: "count", amount: "sum" }}
        tableClassName="fixed-costs-table"
        selected={dataTable.selected}
        onSelectedChange={dataTable.onSelectedChange}
        selectionDisabled={pending}
        groupKey={(cost, field) =>
          viewGroup && field === viewGroup.field
            ? viewGroup.key(cost)
            : field === "person"
              ? (cost.personId ?? "none")
              : (cost.categoryId ?? "none")
        }
        groupLabel={(key, field) =>
          viewGroup && field === viewGroup.field
            ? viewGroup.label(key)
            : key === "none"
            ? "Sin asignar"
            : field === "person"
              ? personName(key)
              : (categories.find((category) => category.id === key)?.name ??
                "Sin categoría")
        }
      />
      <DataTablePagination table={dataTable.table} disabled={pending} />
    </div>
  );
}
