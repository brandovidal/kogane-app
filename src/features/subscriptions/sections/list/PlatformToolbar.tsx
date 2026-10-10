import type { Table } from "@tanstack/react-table";
import { useState } from "react";
import { Layers, ListFilter } from "lucide-react";
import type { Subscription } from "@/shared/api/types";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { SearchField } from "@/shared/components/filters/SearchField";
import {
  AppliedFilterSection,
  AppliedGroupChips,
  AppliedViewSummary,
  AppliedViewToggle,
  CountedToolbarButton,
  GroupingMenu,
  ViewModeToggle,
  type RowColorRulesMenuProps,
} from "@/shared/components/toolbar";
import {
  PLATFORM_FILTER_KEYS,
  PLATFORM_SHEET_FILTER_KEYS,
} from "../../constants/platforms";
import { countPlatformFilters } from "../../lib/platform-filters";
import type { PlatformView } from "./PlatformViewBar";
import { PlatformViewSettings } from "./PlatformViewSettings";

export function PlatformToolbar({
  filters,
  onFiltersChange,
  groupBy,
  onGroupByChange,
  view,
  onViewChange,
  table,
  onOpenFilters,
  rowColors,
}: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  groupBy: Array<"person" | "period">;
  onGroupByChange: (group: Array<"person" | "period">) => void;
  view: PlatformView;
  onViewChange: (view: PlatformView) => void;
  table: Table<Subscription>;
  onOpenFilters: () => void;
  rowColors: RowColorRulesMenuProps;
}) {
  const [showApplied, setShowApplied] = useState(false);
  const activeFilters = countPlatformFilters(
    filters,
    PLATFORM_SHEET_FILTER_KEYS,
  );
  const sheetFilterCount = countPlatformFilters(filters, PLATFORM_FILTER_KEYS);
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());
  const visible = columns.filter((column) => column.getIsVisible()).length;
  const columnVisibilityOptions = columns.map((column) => ({
    id: column.id,
    label: String(column.columnDef.meta?.label ?? column.id),
    visible: column.getIsVisible(),
    onVisibleChange: (next: boolean) => column.toggleVisibility(next),
  }));
  const resetView = () => {
    onFiltersChange({});
    onGroupByChange([]);
    onViewChange("list");
    table.resetColumnVisibility();
  };
  const hasViewSettings =
    activeFilters > 0 ||
    !!filters.q?.trim() ||
    groupBy.length > 0 ||
    view !== "list" ||
    visible !== columns.length;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="toolbar"
          aria-label="Herramientas de plataformas"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
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
            count={activeFilters}
            variant="ghost"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={onOpenFilters}
          />
          <GroupingMenu
            value={groupBy}
            onChange={onGroupByChange}
            options={[
              { value: "period", label: "Período" },
              { value: "person", label: "Persona" },
            ]}
            multiple
            ordered
            align="start"
            className="w-56"
            trigger={
              <CountedToolbarButton
                label="Agrupar"
                icon={<Layers className="size-4" />}
                count={groupBy.length}
                variant="ghost"
                className="h-8 gap-1.5 text-muted-foreground"
              />
            }
          />
          <AppliedViewToggle
            count={activeFilters + groupBy.length}
            open={showApplied}
            onOpenChange={setShowApplied}
          />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <PlatformViewSettings
            columns={columnVisibilityOptions}
            visible={visible}
            filterCount={sheetFilterCount}
            onOpenFilters={onOpenFilters}
            groupBy={groupBy}
            onGroupByChange={onGroupByChange}
            canReset={hasViewSettings}
            onReset={resetView}
            rowColors={rowColors}
          />
          {(view === "list" || view === "cards") && (
            <>
              <span
                aria-hidden="true"
                className="mx-1 hidden h-5 w-px bg-border sm:block"
              />
              <ViewModeToggle
                value={view === "cards" ? "cards" : "table"}
                onChange={(mode) =>
                  onViewChange(mode === "cards" ? "cards" : "list")
                }
              />
            </>
          )}
        </div>
      </div>
      {showApplied && activeFilters + groupBy.length > 0 && (
        <AppliedViewSummary
          onAddFilter={onOpenFilters}
          onReset={resetView}
          resetDisabled={!hasViewSettings}
        >
          {groupBy.length > 0 && (
            <AppliedGroupChips
              value={groupBy}
              options={[
                { value: "period", label: "Período" },
                { value: "person", label: "Persona" },
              ]}
              onChange={onGroupByChange}
            />
          )}
          {activeFilters > 0 && (
            <AppliedFilterSection label="Filtros">
              <ActiveExpenseFilterChips
                fields={PLATFORM_SHEET_FILTER_KEYS}
                value={{ ...filters, q: undefined }}
                onChange={(next) => onFiltersChange({ ...next, q: filters.q })}
                tone="brand"
                maxVisibleItems={3}
                collapsible={false}
                showClearAll={false}
              />
            </AppliedFilterSection>
          )}
        </AppliedViewSummary>
      )}
    </>
  );
}
