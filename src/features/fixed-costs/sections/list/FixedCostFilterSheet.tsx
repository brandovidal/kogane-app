import { RecordSearchField } from "@/shared/components/filters/RecordSearchField";
import { FilterSheetShell } from "@/shared/components/filters/FilterSheetShell";
import { MoreFilters } from "@/shared/components/filters/MoreFilters";
import { Button } from "@/ui/button";
import { SheetDescription, SheetTitle } from "@/ui/sheet";
import { Trash2 } from "lucide-react";

import type {
  ExpenseFilterKey,
  ExpenseFilterValues,
} from "@/features/expenses/types/expense-filters";
import { ExpenseFilterFields } from "@/features/expenses/components/filters/ExpenseFilterFields";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import { FixedCostPeriodSelector } from "../../components/header/FixedCostPeriodSelector";
import { FIXED_COST_STATUSES } from "../../constants/statuses";

const PRIMARY_FIELDS: ExpenseFilterKey[] = ["person", "category"];
const ADDITIONAL_FIELDS: ExpenseFilterKey[] = [
  "method",
  "currency",
  "type",
  "shared",
  "dueFrom",
  "dueTo",
];

export function FixedCostFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
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
  shown: number;
  total: number;
  filterCount: number;
  onClear: () => void;
  showPeriod: boolean;
  personCounts: Record<string, number>;
}) {
  const hasSelectedPeriod = !!(filters.month || filters.year);
  const appliedCount = filterCount + (showPeriod && hasSelectedPeriod ? 1 : 0);
  const additionalCount = countActiveExpenseFilters(filters, ADDITIONAL_FIELDS);
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
            {appliedCount > 0 && (
              <span className="rounded-full bg-brand/15 px-2 text-xs font-semibold text-brand">
                {appliedCount}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Mostrando {shown} de {total} costos fijos
          </SheetDescription>
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
      <RecordSearchField
        value={filters.q ?? ""}
        onChange={(q) => onFiltersChange({ ...filters, q: q || undefined })}
        className="w-full sm:hidden"
      />

      {showPeriod && (
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            {hasSelectedPeriod && (
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-brand"
              />
            )}
            Período
          </h3>
          <FixedCostPeriodSelector showPresets={false} />
        </section>
      )}

      <section>
        <ExpenseFilterFields
          fields={["status"]}
          value={filters}
          onChange={onFiltersChange}
          statuses={FIXED_COST_STATUSES}
          panel
          fullWidth
          statusAllLabel="Todos los estados"
          activeMarkers
          showIcons={false}
        />
      </section>

      <ExpenseFilterFields
        fields={PRIMARY_FIELDS}
        value={filters}
        onChange={onFiltersChange}
        panel
        personInPanel
        personCounts={personCounts}
        activeMarkers
        showIcons={false}
      />

      <MoreFilters
        activeCount={additionalCount}
        activeCountDisplay="inline"
        defaultOpen
      >
        <ExpenseFilterFields
          fields={ADDITIONAL_FIELDS}
          value={filters}
          onChange={onFiltersChange}
          panel
          activeMarkers
          showIcons={false}
          wrapAdditionalFilters={false}
          sharedOwnLabel="No compartidos"
        />
      </MoreFilters>
    </FilterSheetShell>
  );
}
