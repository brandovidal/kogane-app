import { useState } from "react";
import { ArrowDownUp, ChevronDown, Columns3, Layers, ListFilter, SlidersHorizontal } from "lucide-react";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { SearchField } from "@/shared/components/filters/SearchField";
import {
  AppliedFilterSection,
  AppliedGroupChips,
  AppliedSortChip,
  AppliedViewSummary,
  AppliedViewToggle,
  ColumnVisibilityMenu,
  CountedToolbarButton,
  GroupingMenu,
  SortMenu,
  ViewModeToggle,
  type ColumnVisibilityOption,
} from "@/shared/components/toolbar";
import type { MonthlyPeriod } from "@/shared/types/period";
import type { ViewMode } from "@/shared/types/data-view";
import { Button } from "@/ui/button";
import { DAILY_PANEL_FILTER_KEYS, DAILY_SORT_OPTIONS, type DailySort } from "../../constants/daily";
import { DailyFilterSheet } from "./DailyFilterSheet";
import { DailyViewSettings } from "./DailyViewSettings";

export function DailyToolbar({
  filters,
  onFiltersChange,
  me,
  shown,
  total,
  groupBy,
  onGroupByChange,
  hideEmptyGroups,
  onHideEmptyGroupsChange,
  view,
  onViewChange,
  columns,
  sort,
  onSortChange,
  period,
  onPeriodChange,
  groupOptions,
  onReset,
}: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  me?: string;
  shown: number;
  total: number;
  groupBy: string;
  onGroupByChange: (groupBy: string) => void;
  hideEmptyGroups: boolean;
  onHideEmptyGroupsChange: (hide: boolean) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  columns: ColumnVisibilityOption[];
  sort: DailySort;
  onSortChange: (sort: DailySort) => void;
  period: MonthlyPeriod;
  onPeriodChange: (period: MonthlyPeriod) => void;
  groupOptions?: { value: string; label: string }[];
  onReset: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showApplied, setShowApplied] = useState(false);
  const visibleColumns = columns.filter((column) => column.visible).length;
  const filterCount = countActiveExpenseFilters(filters, DAILY_PANEL_FILTER_KEYS);
  const activeGroupBy = groupOptions ? groupBy : "none";
  const sortIsCustom = sort !== "date-desc";
  const appliedCount = filterCount + (sortIsCustom ? 1 : 0) + (activeGroupBy === "none" ? 0 : 1);
  const hasHiddenColumns = columns.some((column) => !column.visible);
  const hasCustomSettings =
    filterCount > 0 || !!filters.q?.trim() || activeGroupBy !== "none" || view !== "table" || sortIsCustom || hasHiddenColumns;
  const clearFilters = () => onFiltersChange({ q: filters.q });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="toolbar" aria-label="Herramientas de la tabla" className="flex min-w-0 flex-wrap items-center gap-1">
          <SearchField
            className="w-full sm:w-56"
            placeholder="Buscar"
            shortcut="/"
            value={filters.q ?? ""}
            onChange={(next) => onFiltersChange({ ...filters, q: next || undefined })}
          />
          <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <CountedToolbarButton
            label="Filtros"
            icon={<ListFilter className="size-4" />}
            count={filterCount}
            variant={filterCount > 0 ? "secondary" : "outline"}
            className="h-8 gap-1.5 rounded-sm border-border/60 px-2"
            onClick={() => setFilterOpen(true)}
          />
          <SortMenu
            value={sort === "date-desc" ? undefined : sort}
            onChange={(next) => onSortChange((next ?? "date-desc") as DailySort)}
            options={DAILY_SORT_OPTIONS.filter((option) => option.value !== "date-desc")}
            originalLabel="Fecha · más reciente"
            align="start"
            trigger={
              <CountedToolbarButton
                label="Ordenar"
                icon={<ArrowDownUp className="size-4" />}
                count={sortIsCustom ? 1 : 0}
                variant={sortIsCustom ? "secondary" : "outline"}
                className="h-8 gap-1.5 rounded-sm border-border/60 px-2"
              />
            }
          />
          {groupOptions && (
            <GroupingMenu
              value={activeGroupBy}
              onChange={onGroupByChange}
              options={groupOptions}
              hideEmpty={
                activeGroupBy === "none"
                  ? undefined
                  : {
                      checked: hideEmptyGroups,
                      onChange: onHideEmptyGroupsChange,
                    }
              }
              align="start"
              trigger={
                <CountedToolbarButton
                  label="Agrupar"
                  icon={<Layers className="size-4" />}
                  count={activeGroupBy === "none" ? 0 : 1}
                  trailingIcon={<ChevronDown className="size-3.5" />}
                  variant={activeGroupBy !== "none" ? "secondary" : "outline"}
                  className="h-8 gap-1.5 rounded-sm border-border/60 px-2"
                />
              }
            />
          )}
          <AppliedViewToggle count={appliedCount} open={showApplied} onOpenChange={setShowApplied} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {view === "table" && columns.length > 0 && (
            <ColumnVisibilityMenu
              columns={columns}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2"
                  aria-label={`Columnas visibles: ${visibleColumns} de ${columns.length}`}
                >
                  <Columns3 className="size-4" />
                  <span className="hidden lg:inline">Columnas</span>
                  <span className="text-xs text-muted-foreground">
                    {visibleColumns}/{columns.length}
                  </span>
                </Button>
              }
            />
          )}
          <DailyViewSettings
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            view={view}
            onViewChange={onViewChange}
            columns={columns}
            visibleColumnCount={visibleColumns}
            filterCount={filterCount}
            groupBy={activeGroupBy}
            groupOptions={groupOptions}
            onGroupByChange={onGroupByChange}
            sort={sort}
            onSortChange={onSortChange}
            onOpenFilters={() => {
              setSettingsOpen(false);
              setFilterOpen(true);
            }}
            onReset={onReset}
            hasCustomSettings={hasCustomSettings}
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
          />
          <ViewModeToggle value={view} onChange={onViewChange} />
        </div>
      </div>

      {showApplied && appliedCount > 0 && (
        <AppliedViewSummary onAddFilter={() => setFilterOpen(true)} onReset={onReset} resetDisabled={!hasCustomSettings}>
          {sortIsCustom && (
            <AppliedSortChip
              label={DAILY_SORT_OPTIONS.find((option) => option.value === sort)?.label.split(" · ")[0] ?? "Orden"}
              descending={sort.endsWith("desc")}
              onRemove={() => onSortChange("date-desc")}
            />
          )}
          {activeGroupBy !== "none" && groupOptions && (
            <AppliedGroupChips value={[activeGroupBy]} options={groupOptions} onChange={(next) => onGroupByChange(next[0] ?? "none")} />
          )}
          {filterCount > 0 && (
            <AppliedFilterSection label="Filtros">
              <ActiveExpenseFilterChips
                fields={DAILY_PANEL_FILTER_KEYS}
                value={filters}
                onChange={onFiltersChange}
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

      <DailyFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        period={period}
        onPeriodChange={onPeriodChange}
        shown={shown}
        total={total}
        filterCount={filterCount}
        onClear={clearFilters}
      />
    </div>
  );
}
