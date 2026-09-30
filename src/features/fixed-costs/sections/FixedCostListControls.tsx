import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
import { GroupingMenu } from "@/shared/components/toolbar/GroupingMenu";
import { getCurrentMonth, getCurrentYear, getMonthName } from "@/shared/lib/dates";

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
  const month = Number(filters.month) || getCurrentMonth();
  const year = Number(filters.year) || getCurrentYear();
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const hasPeriod = !!filters.month && !!filters.year;
  const isCurrentPeriod =
    filters.month === String(currentMonth) &&
    filters.year === String(currentYear);
  const changePeriod = (delta: number) => {
    const index = year * 12 + month - 1 + delta;
    const nextMonth = (index % 12) + 1;
    const nextYear = Math.floor(index / 12);
    onFiltersChange({
      ...filters,
      month: String(nextMonth),
      year: String(nextYear),
    });
  };

  return (
    <div className="space-y-2">
      <ExpenseFilters
        fields={FIXED_COST_FILTER_KEYS}
        value={filters}
        onChange={onFiltersChange}
        personInPanel
        primaryControls={
          <div
            className="flex h-9 w-max items-center gap-1 whitespace-nowrap"
            role="group"
            aria-label="Navegación mensual"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Mes anterior"
              title="Mes anterior"
              onClick={() => changePeriod(-1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-32 shrink-0 whitespace-nowrap px-2 text-center text-sm font-medium tabular-nums">
              {hasPeriod
                ? `${getMonthName(month)} - ${year}`
                : "Todos los períodos"}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Mes siguiente"
              title="Mes siguiente"
              onClick={() => changePeriod(1)}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 h-8 shrink-0"
              aria-label="Ir al mes actual"
              title="Ir al mes actual"
              disabled={isCurrentPeriod}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  month: String(currentMonth),
                  year: String(currentYear),
                })
              }
            >
              <CalendarDays className="size-4" />
              Hoy
            </Button>
          </div>
        }
        description="Selecciona el mes y año del registro. Puedes combinarlos con personas, estados y un rango de vencimiento."
        countLabel="costos fijos"
        statuses={FIXED_COST_STATUSES}
        shown={shown}
        total={total}
        showActiveSummary={false}
        viewToggle={
          <div className="flex items-center gap-1">
            <GroupingMenu
              value={groupBy}
              onChange={onGroupByChange}
              options={FIXED_COST_GROUP_OPTIONS}
              multiple
            />
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
            onGroupByChange={(next) => onGroupByChange(next)}
            groupByLabel={groupBy.map((field) => FIXED_COST_GROUP_LABELS[field]).join(" → ")}
            periodChip={
              hasPeriod
                ? {
                    label: `Período: ${getMonthName(month)} ${year}`,
                    onRemove: () =>
                      onFiltersChange({
                        ...filters,
                        month: undefined,
                        year: undefined,
                      }),
                  }
                : undefined
            }
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
