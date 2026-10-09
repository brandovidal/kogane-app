import { useMemo, useState } from "react";
import { Layers, ListFilter } from "lucide-react";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { SearchField } from "@/shared/components/filters/SearchField";
import { useMe } from "@/shared/api/hooks/catalogs";
import { CardOverviewFilterSheet } from "./CardOverviewFilterSheet";
import {
  CARD_OVERVIEW_FILTER_KEYS,
  CARD_OVERVIEW_GROUP_OPTIONS,
  type CardOverviewGroupBy,
} from "../../constants/filters";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import {
  AppliedFilterSection,
  AppliedGroupChips,
  AppliedViewSummary,
  AppliedViewToggle,
  CountedToolbarButton,
  GroupingMenu,
  ViewModeToggle,
} from "@/shared/components/toolbar";
import { Button } from "@/ui/button";
import type { CreditCardExpense } from "@/shared/api/types";

export function CardOverviewToolbar({
  filters,
  onFiltersChange,
  layout,
  onLayoutChange,
  groupBy,
  onGroupByChange,
  paymentMethodRecords,
}: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  layout: "cards" | "table";
  onLayoutChange: (layout: "cards" | "table") => void;
  groupBy: CardOverviewGroupBy[];
  onGroupByChange: (groupBy: CardOverviewGroupBy[]) => void;
  paymentMethodRecords: Pick<CreditCardExpense, "paymentMethodId">[];
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [showApplied, setShowApplied] = useState(false);
  const me = useMe();
  const paymentMethodCounts = useMemo(
    () =>
      paymentMethodRecords.reduce<Record<string, number>>((counts, expense) => {
        if (expense.paymentMethodId)
          counts[expense.paymentMethodId] =
            (counts[expense.paymentMethodId] ?? 0) + 1;
        return counts;
      }, {}),
    [paymentMethodRecords],
  );
  const filterCount = countActiveExpenseFilters(
    filters,
    CARD_OVERVIEW_FILTER_KEYS,
  );
  const appliedCount = filterCount + groupBy.length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-1"
          role="toolbar"
          aria-label="Herramientas de tarjetas"
        >
          <SearchField
            value={filters.q ?? ""}
            onChange={(q) => onFiltersChange({ ...filters, q: q || undefined })}
            placeholder="Buscar"
            shortcut="/"
            className="w-full sm:w-56"
          />
          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px bg-border sm:block"
          />
          <CountedToolbarButton
            label="Filtros"
            icon={<ListFilter className="size-4" />}
            count={filterCount}
            variant="ghost"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={() => setFilterOpen(true)}
          />
          <GroupingMenu
            value={groupBy}
            onChange={onGroupByChange}
            options={[...CARD_OVERVIEW_GROUP_OPTIONS]}
            multiple
            ordered
            maxSelected={2}
            align="start"
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-muted-foreground"
              >
                <Layers className="size-4" />
                <span className="text-sm">Agrupar</span>
                {!!groupBy.length && (
                  <span className="text-xs font-semibold text-brand">
                    {groupBy.length}
                  </span>
                )}
              </Button>
            }
          />
          <AppliedViewToggle
            count={appliedCount}
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
      {showApplied && appliedCount > 0 && (
        <AppliedViewSummary
          onAddFilter={() => setFilterOpen(true)}
          onReset={() => {
            onFiltersChange({});
            onGroupByChange([]);
          }}
          resetDisabled={appliedCount === 0}
        >
          {!!groupBy.length && (
            <AppliedGroupChips
              value={groupBy}
              options={CARD_OVERVIEW_GROUP_OPTIONS}
              onChange={(next) =>
                onGroupByChange(next.slice(0, 2) as CardOverviewGroupBy[])
              }
            />
          )}
          {filterCount > 0 && (
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
                formatFilterLabel={(key, label) =>
                  key === "method" ? "Tarjeta" : label
                }
              />
            </AppliedFilterSection>
          )}
        </AppliedViewSummary>
      )}
      <CardOverviewFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        fields={CARD_OVERVIEW_FILTER_KEYS.filter((field) => field !== "q")}
        paymentMethodCounts={paymentMethodCounts}
      />
    </>
  );
}
