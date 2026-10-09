import { Trash2 } from "lucide-react";

import { Button } from "@/ui/button";
import { SheetDescription, SheetTitle } from "@/ui/sheet";

import { FilterSheetShell } from "@/shared/components/filters/FilterSheetShell";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { ExpenseFilterFields } from "@/features/expenses/components/filters/ExpenseFilterFields";
import { FixedCostPeriodSelector } from "../../components/header/FixedCostPeriodSelector";

import { FIXED_COST_STATUSES } from "../../constants/statuses";
import { FIXED_COST_PANEL_FILTER_KEYS } from "../../lib/fixed-cost-filters";

export function FixedCostFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  me,
  shown,
  total,
  filterCount,
  onClear,
  showPeriod,
  personCounts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  me?: string;
  shown: number;
  total: number;
  filterCount: number;
  onClear: () => void;
  showPeriod: boolean;
  personCounts: Record<string, number>;
}) {
  return (
    <FilterSheetShell
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="w-[min(26rem,calc(100vw-1rem))] gap-0 p-0"
      headerClassName="gap-2 border-b p-5 pr-12"
      bodyClassName="space-y-5 p-5"
      footerClassName="flex-row items-center justify-between border-t bg-background p-4"
      header={
        <>
          <SheetTitle className="flex items-center gap-2">
            Filtros
            {filterCount > 0 && (
              <span className="rounded-full bg-brand/15 px-2 text-xs font-semibold text-brand">
                {filterCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Mostrando {shown} de {total} costos fijos
          </SheetDescription>
          <ActiveExpenseFilterChips
            fields={FIXED_COST_PANEL_FILTER_KEYS}
            value={{ ...filters, month: undefined, year: undefined }}
            onChange={(next) =>
              onFiltersChange({
                ...next,
                month: filters.month,
                year: filters.year,
                q: filters.q,
              })
            }
            me={me}
            tone="brand"
            maxVisibleItems={3}
            collapsible={false}
          />
        </>
      }
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={filterCount === 0}
            onClick={onClear}
          >
            <Trash2 className="size-4" />
            Limpiar todo
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 px-4"
            onClick={() => onOpenChange(false)}
          >
            Ver {shown} {shown === 1 ? "resultado" : "resultados"}
          </Button>
        </>
      }
    >
      {showPeriod && (
        <section className="space-y-2">
          <h4 className="eyebrow">Período</h4>
          <FixedCostPeriodSelector />
        </section>
      )}
      <section className="space-y-3">
        <div className="flex flex-col gap-3">
          <ExpenseFilterFields
            fields={FIXED_COST_PANEL_FILTER_KEYS}
            value={filters}
            onChange={onFiltersChange}
            statuses={FIXED_COST_STATUSES}
            panel
            personInPanel
            personCounts={personCounts}
          />
        </div>
      </section>
    </FilterSheetShell>
  );
}
