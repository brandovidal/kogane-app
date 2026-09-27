import type { Category, FixedCost } from "@/shared/api/types";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { type ViewMode } from "@/shared/types/data-view";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { OwnPart } from "@/features/expenses/components/OwnPart";
import type { CatalogName, FixedCostActions, FixedCostGroupBy } from "@/features/fixed-costs/types/fixed-cost-types";
import { getFixedCostColumns } from "./fixed-cost-columns";

export interface FixedCostResultsSectionProps {
  items: FixedCost[];
  totalRecords: number;
  categories: Category[];
  personName: CatalogName;
  accountName: CatalogName;
  view: ViewMode;
  groupBy: FixedCostGroupBy;
  totals: { paid: number; own: number };
  actions: FixedCostActions;
}

export function FixedCostResultsSection({ items, totalRecords, categories, personName, accountName, view, groupBy, totals, actions }: FixedCostResultsSectionProps) {
  if (!items.length) {
    return <EmptyState description={totalRecords ? "No hay costos fijos con estos filtros" : "No hay costos fijos en este mes"} />;
  }

  return (
    <GroupedDataView
      items={items}
      columns={getFixedCostColumns({ categories, personName, accountName, actions })}
      rowKey={(cost) => cost.id}
      view={view}
      groupBy={groupBy}
      groupKey={(cost, field) => field === "person" ? (cost.personId ?? "none") : (cost.categoryId ?? "none")}
      groupLabel={(key, field) => key === "none" ? "Sin asignar" : field === "person" ? personName(key) : (categories.find((category) => category.id === key)?.name ?? "Sin categoría")}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{items.length} registros</span>
          <div className="text-right">
            <span className="text-sm font-semibold">Total: S/ {totals.paid.toFixed(2)}</span>
            <OwnPart {...totals} />
          </div>
        </div>
      }
    />
  );
}
