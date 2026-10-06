import type { ReactNode } from "react";
import type { Category, FixedCost } from "@/shared/api/types";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { type ViewMode } from "@/shared/types/data-view";
import { OwnPart } from "@/features/expenses/components/OwnPart";
import type {
  CatalogName,
  FixedCostGroupBy,
} from "@/features/fixed-costs/types/fixed-cost-types";
import { DataTableComplex } from "@/shared/components/data-display/DataTableComplex";
import { DataTablePagination } from "@/shared/components/data-display/DataTablePagination";
import { formatCurrency } from "@/shared/lib/currency";
import { totalsOf } from "@/features/expenses/lib/shared-expense";
import { isCompletedFixedCost } from "../../lib/fixed-cost-summary";
import type { useFixedCostTable } from "../../hooks/useFixedCostTable";
import { FixedCostCard } from "../../components/list/FixedCostCard";
import { FixedCostEmptyState } from "../../components/list/FixedCostEmptyState";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import { FIXED_COST_FILTER_KEYS } from "../../lib/fixed-cost-filters";
import { compareFixedCostMonthGroups } from "../../lib/fixed-cost-views";
import { DataLoadingSkeleton } from "@/shared/components/data-display/DataLoadingSkeleton";

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
  viewGroup?: {
    field: string;
    key: (cost: FixedCost) => string;
    label: (key: string) => ReactNode;
  };
  emptyDescription?: string;
  emptyTitle?: string;
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  me?: string;
  periodLabel: string;
  periodCount: number;
  hasScopeFilter?: boolean;
  onOpenFilters: () => void;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onSearchAllMonths: () => void;
  onCreate: () => void;
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
  emptyTitle,
  filters,
  onFiltersChange,
  me,
  periodLabel,
  periodCount,
  hasScopeFilter = false,
  onOpenFilters,
  onClearFilters,
  onClearSearch,
  onSearchAllMonths,
  onCreate,
}: FixedCostResultsSectionProps) {
  const emptyMessage =
    emptyDescription ??
    (totalRecords
      ? "No hay costos fijos con estos filtros"
      : "No hay costos fijos en este período");
  const fields = viewGroup ? [viewGroup.field, ...groupBy] : groupBy;
  const hasSearch = !!filters.q?.trim();
  const filterFields = FIXED_COST_FILTER_KEYS.filter(
    (key) => key !== "month" && key !== "year",
  );
  const hasActiveFilters =
    countActiveExpenseFilters(filters, filterFields) > 0 || hasScopeFilter;
  const emptyKind = hasSearch
    ? "search"
    : hasActiveFilters
      ? "filters"
      : "period";
  const emptyState = (
    <FixedCostEmptyState
      view={view}
      kind={emptyKind}
      filters={filters}
      me={me}
      periodLabel={periodLabel}
      periodCount={periodCount}
      titleOverride={emptyTitle}
      descriptionOverride={emptyDescription}
      onFiltersChange={onFiltersChange}
      onOpenFilters={onOpenFilters}
      onClearFilters={onClearFilters}
      onClearSearch={onClearSearch}
      onSearchAllMonths={onSearchAllMonths}
      onCreate={onCreate}
    />
  );
  const summaryFor = (records: FixedCost[], key?: string, field?: string) => {
    const subtotal = totalsOf(records);
    const tone =
      field === "urgency"
        ? key === "overdue"
          ? "text-destructive"
          : key === "week" || key === "month"
            ? "text-amber-600 dark:text-amber-300"
            : "text-muted-foreground"
        : "text-foreground";
    return {
      label: (
        <div
          className={`whitespace-nowrap text-right text-sm font-semibold ${tone}`}
        >
          {formatCurrency(subtotal.paid)}
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
        calculationStorageKey={items.length ? "fixed-costs" : undefined}
        calculationDefaults={{ description: "count", amount: "sum" }}
        pagination={items.length > 0}
        loading={loading}
        error={error ? "No se pudieron cargar los costos fijos." : undefined}
        emptyMessage={items.length ? emptyMessage : emptyState}
      />
    );
  if (loading)
    return (
      <DataLoadingSkeleton
        variant={view === "table" ? "table" : "cards"}
        columns={dataTable.visibleColumns.length}
      />
    );
  if (error)
    return (
      <p role="alert" className="py-8 text-center text-sm text-destructive">
        No se pudieron cargar los costos fijos.
      </p>
    );
  if (!items.length) {
    if (view === "cards")
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {emptyState}
        </div>
      );
    return emptyState;
  }

  return (
    <div className="space-y-3">
      <GroupedDataView
        items={dataTable.table
          .getPrePaginationRowModel()
          .rows.map((row) => row.original)}
        columns={dataTable.visibleColumns}
        rowKey={(cost) => cost.id}
        view={view}
        groupBy={fields}
        primaryGroupDepth={
          viewGroup?.field === "month" ? 0 : viewGroup && groupBy.length ? 1 : 0
        }
        collapsiblePrimaryGroups={viewGroup?.field === "month"}
        initialOpenPrimaryGroups={2}
        paginatePrimaryGroups={viewGroup?.field === "month"}
        comparePrimaryGroups={
          viewGroup?.field === "month"
            ? (left, right) => compareFixedCostMonthGroups(left, right)
            : undefined
        }
        groupDetailsFor={(groupItems, _key, field) => {
          if (field !== "month") return null;
          const completed = groupItems.filter(isCompletedFixedCost).length;
          const allCompleted = completed === groupItems.length;
          return (
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${allCompleted ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-400/15 text-amber-300"}`}
            >
              {allCompleted
                ? "completo"
                : `${completed} de ${groupItems.length} pagados`}
            </span>
          );
        }}
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
      {viewGroup?.field !== "month" && (
        <DataTablePagination table={dataTable.table} disabled={pending} />
      )}
    </div>
  );
}
