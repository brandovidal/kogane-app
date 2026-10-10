import { useMemo, useState } from "react";
import type { Table } from "@tanstack/react-table";
import {
  ArrowDownUp,
  Columns3,
  Layers,
  ListFilter,
  SlidersHorizontal,
} from "lucide-react";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { FixedCostFilterSheet } from "./FixedCostFilterSheet";
import { FixedCostViewSettings } from "./FixedCostViewSettings";
import { FixedCostMobileViewSettings } from "./FixedCostMobileViewSettings";
import { FixedCostToolbarButton } from "./FixedCostToolbarButton";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import type { FixedCost } from "@/shared/api/types";
import { PERSON_UNASSIGNED } from "@/features/expenses/constants/expense-filters";
import { SearchField } from "@/shared/components/filters/SearchField";
import { DataLoadingSkeleton } from "@/shared/components/data-display/DataLoadingSkeleton";
import {
  AppliedFilterSection,
  AppliedGroupChips,
  AppliedSortChip,
  AppliedViewSummary,
  AppliedViewToggle,
  ColumnVisibilityMenu,
  GroupingMenu,
  SortMenu,
  ViewModeToggle,
  type RowColorRulesMenuProps,
} from "@/shared/components/toolbar";
import type { ViewMode } from "@/shared/types/data-view";
import { Button } from "@/ui/button";
import {
  FIXED_COST_PANEL_FILTER_KEYS,
  FIXED_COST_GROUP_OPTIONS,
} from "../../lib/fixed-cost-filters";
import {
  FIXED_COST_SORTS,
  findFixedCostSort,
} from "../../lib/fixed-cost-views";
import type { FixedCostGroupBy } from "../../types/fixed-cost-types";

export interface FixedCostToolbarProps {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  me?: string;
  shown: number;
  total: number;
  groupBy: FixedCostGroupBy;
  onGroupByChange: (groupBy: FixedCostGroupBy) => void;
  sort?: string;
  onSortChange: (sort: string | undefined) => void;
  onResetView: () => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  table?: Table<FixedCost>;
  canGroup?: boolean;
  canSort?: boolean;
  canChangeLayout?: boolean;
  showPeriodInFilters?: boolean;
  filterSheetOpen?: boolean;
  onFilterSheetOpenChange?: (open: boolean) => void;
  loading?: boolean;
  personRecords?: FixedCost[];
  paymentMethodRecords?: Pick<FixedCost, "paymentMethodId">[];
  rowColors?: RowColorRulesMenuProps;
}

export function FixedCostToolbar({
  filters,
  onFiltersChange,
  me,
  shown,
  total,
  groupBy,
  onGroupByChange,
  sort,
  onSortChange,
  onResetView,
  view,
  onViewChange,
  table,
  canGroup = true,
  canSort = true,
  canChangeLayout = true,
  showPeriodInFilters = true,
  filterSheetOpen,
  onFilterSheetOpenChange,
  loading = false,
  personRecords = [],
  paymentMethodRecords = [],
  rowColors,
}: FixedCostToolbarProps) {
  const isDesktopSettings = useMediaQuery("(min-width: 1024px)");
  const [internalSheetOpen, setInternalSheetOpen] = useState(false);
  const sheetOpen = filterSheetOpen ?? internalSheetOpen;
  const setSheetOpen = (open: boolean) => {
    setInternalSheetOpen(open);
    onFilterSheetOpenChange?.(open);
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showApplied, setShowApplied] = useState(false);
  const filterCount = countActiveExpenseFilters(
    filters,
    FIXED_COST_PANEL_FILTER_KEYS,
  );
  const personCounts = useMemo(
    () =>
      personRecords.reduce<Record<string, number>>((counts, record) => {
        const id = record.personId ?? PERSON_UNASSIGNED;
        counts[id] = (counts[id] ?? 0) + 1;
        return counts;
      }, {}),
    [personRecords],
  );
  const paymentMethodCounts = useMemo(
    () =>
      paymentMethodRecords.reduce<Record<string, number>>((counts, record) => {
        if (record.paymentMethodId) {
          counts[record.paymentMethodId] =
            (counts[record.paymentMethodId] ?? 0) + 1;
        }
        return counts;
      }, {}),
    [paymentMethodRecords],
  );
  const sortOption = findFixedCostSort(sort);
  const appliedCount = filterCount + (sortOption ? 1 : 0) + groupBy.length;
  const hasViewSettings =
    filterCount > 0 ||
    !!filters.q?.trim() ||
    !!sortOption ||
    groupBy.length > 0;
  const hideable =
    table?.getAllLeafColumns().filter((column) => column.getCanHide()) ?? [];
  const visible = hideable.filter((column) => column.getIsVisible()).length;
  const columnVisibilityOptions = hideable.map((column) => ({
    id: column.id,
    label: String(column.columnDef.meta?.label ?? column.id),
    visible: column.getIsVisible(),
    onVisibleChange: (next: boolean) => column.toggleVisibility(next),
  }));
  const filtersWithoutPeriod = {
    ...filters,
    month: undefined,
    year: undefined,
  };
  const clearFilters = () =>
    onFiltersChange({ month: filters.month, year: filters.year, q: filters.q });

  if (loading) return <DataLoadingSkeleton variant="toolbar" />;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="toolbar"
          aria-label="Herramientas de la tabla"
          className="flex min-w-0 flex-wrap items-center gap-1"
        >
          <SearchField
            className="w-full sm:w-56"
            placeholder="Buscar"
            shortcut="/"
            value={filters.q ?? ""}
            onChange={(next) =>
              onFiltersChange({ ...filters, q: next || undefined })
            }
          />
          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px bg-border sm:block"
          />
          <FixedCostToolbarButton
            icon={ListFilter}
            label="Filtros"
            count={filterCount}
            onClick={() => setSheetOpen(true)}
          />
          {canSort && (
            <SortMenu
              value={sort}
              onChange={onSortChange}
              options={FIXED_COST_SORTS}
              align="start"
              className="w-60"
              trigger={
                <FixedCostToolbarButton
                  icon={ArrowDownUp}
                  label="Ordenar"
                  count={sortOption ? 1 : 0}
                />
              }
            />
          )}
          {canGroup && (
            <GroupingMenu<FixedCostGroupBy>
              value={groupBy}
              onChange={onGroupByChange}
              options={FIXED_COST_GROUP_OPTIONS}
              multiple
              ordered
              align="start"
              className="w-56"
              trigger={
                <FixedCostToolbarButton
                  icon={Layers}
                  label="Agrupar"
                  count={groupBy.length}
                />
              }
            />
          )}
          <AppliedViewToggle
            count={appliedCount}
            open={showApplied}
            onOpenChange={setShowApplied}
          />
        </div>
        <div className="flex items-center gap-1">
          {table && hideable.length > 0 && view === "table" && (
            <ColumnVisibilityMenu
              columns={columnVisibilityOptions}
              trigger={
                <FixedCostToolbarButton
                  icon={Columns3}
                  label="Columnas"
                  count={`${visible}/${hideable.length}`}
                />
              }
            />
          )}
          {isDesktopSettings ? (
            <FixedCostViewSettings
              open={settingsOpen}
              onOpenChange={(open) => {
                setSettingsOpen(open);
              }}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Ajustes de vista"
                  title="Ajustes de vista"
                  className="size-8 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <SlidersHorizontal className="size-4" />
                </Button>
              }
              view={view}
              onViewChange={onViewChange}
              canChangeLayout={canChangeLayout}
              columns={columnVisibilityOptions}
              visibleColumnCount={visible}
              filterCount={filterCount}
              onOpenFilters={() => setSheetOpen(true)}
              rowColors={rowColors}
              canSort={canSort}
              sort={sort}
              sortLabel={sortOption?.label}
              onSortChange={onSortChange}
              canGroup={canGroup}
              groupBy={groupBy}
              onGroupByChange={onGroupByChange}
              hasViewSettings={hasViewSettings}
              onResetView={onResetView}
            />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Ajustes de vista"
              title="Ajustes de vista"
              onClick={() => {
                setSettingsOpen(true);
              }}
              className="size-8 rounded-md text-muted-foreground hover:text-foreground"
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          )}
          {canChangeLayout && (
            <ViewModeToggle value={view} onChange={onViewChange} />
          )}
        </div>
      </div>

      {showApplied && appliedCount > 0 && (
        <AppliedViewSummary
          onAddFilter={() => setSheetOpen(true)}
          onReset={onResetView}
          resetDisabled={!hasViewSettings}
        >
          {sortOption && (
            <AppliedSortChip
              label={sortOption.label.split(":")[0]}
              descending={sortOption.desc}
              onRemove={() => onSortChange(undefined)}
            />
          )}
          {groupBy.length > 0 && (
            <AppliedGroupChips<FixedCostGroupBy[number]>
              value={groupBy}
              options={FIXED_COST_GROUP_OPTIONS}
              onChange={onGroupByChange}
            />
          )}
          {filterCount > 0 && (
            <AppliedFilterSection label="Filtros">
              <ActiveExpenseFilterChips
                fields={FIXED_COST_PANEL_FILTER_KEYS}
                value={filtersWithoutPeriod}
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
                showClearAll={false}
              />
            </AppliedFilterSection>
          )}
        </AppliedViewSummary>
      )}

      <FixedCostFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        shown={shown}
        total={total}
        filterCount={filterCount}
        onClear={clearFilters}
        showPeriod={showPeriodInFilters}
        personCounts={personCounts}
        paymentMethodCounts={paymentMethodCounts}
      />
      {!isDesktopSettings && (
        <FixedCostMobileViewSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          filters={filters}
          onFiltersChange={onFiltersChange}
          me={me}
          shown={shown}
          groupBy={groupBy}
          onGroupByChange={onGroupByChange}
          sort={sort}
          onSortChange={onSortChange}
          onResetView={onResetView}
          view={view}
          onViewChange={onViewChange}
          table={table}
          canGroup={canGroup}
          canSort={canSort}
          canChangeLayout={canChangeLayout}
          showPeriodInFilters={showPeriodInFilters}
          filterCount={filterCount}
          personCounts={personCounts}
          paymentMethodCounts={paymentMethodCounts}
          clearFilters={clearFilters}
          hasViewSettings={hasViewSettings}
        />
      )}
    </div>
  );
}
