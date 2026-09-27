import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { type ViewMode } from "@/shared/types/data-view";
import { ExpenseFilters } from "@/features/expenses/components/filters/ExpenseFilters";
import {
  ExportMenu,
  type ExportMenuItem,
} from "@/shared/components/toolbar/ExportMenu";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { FIXED_COST_STATUSES } from "@/features/fixed-costs/constants/statuses";
import { Button } from "@/ui/button";
import {
  FIXED_COST_FILTER_KEYS,
  FIXED_COST_GROUP_LABELS,
  FIXED_COST_GROUP_OPTIONS,
} from "@/features/fixed-costs/lib/fixed-cost-filters";
import type { FixedCostGroupBy } from "@/features/fixed-costs/types/fixed-cost-types";

export interface FixedCostListControlsProps {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  me?: string;
  shown: number;
  total: number;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  groupBy: FixedCostGroupBy;
  onGroupByChange: (groupBy: FixedCostGroupBy) => void;
  exportItems: ExportMenuItem[];
  onCreate: () => void;
  columnSelector?: ReactNode;
}

export function FixedCostListControls({
  filters,
  onFiltersChange,
  me,
  shown,
  total,
  view,
  onViewChange,
  groupBy,
  onGroupByChange,
  exportItems,
  onCreate,
  columnSelector,
}: FixedCostListControlsProps) {
  const changeGrouping = (value: string) => {
    if (value === "none" || value === "person" || value === "category")
      onGroupByChange(value);
  };

  return (
    <div className="space-y-2">
      <ExpenseFilters
        fields={FIXED_COST_FILTER_KEYS}
        value={filters}
        onChange={onFiltersChange}
        personInPanel
        description="Filtra costos fijos por persona, categoría, pago o vencimiento. Las fechas abarcan todos los meses."
        countLabel="costos fijos"
        statuses={FIXED_COST_STATUSES}
        shown={shown}
        total={total}
        groupBy={groupBy}
        onGroupByChange={changeGrouping}
        groupByOptions={FIXED_COST_GROUP_OPTIONS}
        showActiveSummary={false}
        viewToggle={
          <div className="flex items-center gap-1">
            {columnSelector}
            <ViewToggle value={view} onChange={onViewChange} />
          </div>
        }
        appliedFilters={
          <ActiveExpenseFilterChips
            fields={FIXED_COST_FILTER_KEYS}
            value={filters}
            onChange={onFiltersChange}
            me={me}
            groupBy={groupBy}
            onGroupByChange={changeGrouping}
            groupByLabel={FIXED_COST_GROUP_LABELS[groupBy]}
          />
        }
        rightActions={
          <>
            <ExportMenu items={exportItems} />
            <Button size="sm" className="h-9" onClick={onCreate}>
              <Plus className="mr-1 size-4" />
              Nuevo gasto
            </Button>
          </>
        }
      />
    </div>
  );
}
