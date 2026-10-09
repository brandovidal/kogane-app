import { useState } from "react";
import { Activity, ListFilter } from "lucide-react";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { PersonFilterFields } from "@/shared/components/filters/PersonFilterFields";
import { INSTALLMENT_FILTER_OPTIONS } from "@/features/expenses/constants/expense-filters";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { SearchField } from "@/shared/components/filters/SearchField";
import { useMe } from "@/shared/api/hooks/catalogs";
import { CardOverviewFilterSheet } from "./CardOverviewFilterSheet";
import { CARD_OVERVIEW_FILTER_KEYS } from "../../constants/filters";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import {
  AppliedFilterSection,
  AppliedViewSummary,
  AppliedViewToggle,
  CountedToolbarButton,
  ViewModeToggle,
} from "@/shared/components/toolbar";

export function CardOverviewToolbar({
  filters,
  onFiltersChange,
  layout,
  onLayoutChange,
}: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  layout: "cards" | "table";
  onLayoutChange: (layout: "cards" | "table") => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [showApplied, setShowApplied] = useState(false);
  const me = useMe();
  const filterCount = countActiveExpenseFilters(
    filters,
    CARD_OVERVIEW_FILTER_KEYS,
  );
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
          role="toolbar"
          aria-label="Herramientas de tarjetas"
        >
          <SearchField
            value={filters.q ?? ""}
            onChange={(q) => onFiltersChange({ ...filters, q: q || undefined })}
            placeholder="Buscar"
            shortcut="/"
            className="w-full sm:w-44"
          />
          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px bg-border sm:block"
          />
          <PersonFilterFields
            value={filters.person}
            onChange={(person) => onFiltersChange({ ...filters, person })}
            width="w-56"
          />
          <div className="flex items-center gap-1.5">
            <Activity className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Cuota</span>
            <FilterSelect
              label="Cuota"
              value={filters.installments}
              options={INSTALLMENT_FILTER_OPTIONS}
              onChange={(installments) =>
                onFiltersChange({
                  ...filters,
                  installments:
                    installments as ExpenseFilterValues["installments"],
                })
              }
              allLabel="Todos"
              width="w-24"
              labelClassName="sr-only"
            />
          </div>
          <CountedToolbarButton
            label="Filtros"
            icon={<ListFilter className="size-4" />}
            count={filterCount}
            variant="ghost"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={() => setFilterOpen(true)}
          />
          <AppliedViewToggle
            count={filterCount}
            open={showApplied}
            onOpenChange={setShowApplied}
          />
        </div>
        <ViewModeToggle
          value={layout}
          onChange={onLayoutChange}
          label="Presentación de tarjetas"
        />
      </div>
      {showApplied && filterCount > 0 && (
        <AppliedViewSummary
          onAddFilter={() => setFilterOpen(true)}
          onReset={() => onFiltersChange({})}
          resetDisabled={filterCount === 0}
        >
          <AppliedFilterSection label="Filtros">
            <ActiveExpenseFilterChips
              fields={[...CARD_OVERVIEW_FILTER_KEYS]}
              value={filters}
              onChange={onFiltersChange}
              me={me}
              tone="brand"
              maxVisibleItems={3}
              collapsible={false}
              showClearAll={false}
            />
          </AppliedFilterSection>
        </AppliedViewSummary>
      )}
      <CardOverviewFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        fields={CARD_OVERVIEW_FILTER_KEYS.filter((field) => field !== "q")}
      />
    </>
  );
}
