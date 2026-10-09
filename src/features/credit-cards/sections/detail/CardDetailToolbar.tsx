import { useState } from "react";
import { ArrowDownUp, Columns3, Layers, SlidersHorizontal } from "lucide-react";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import type { ExpenseFilterKey } from "@/features/expenses/types/expense-filters";
import { ExpenseFilters } from "@/features/expenses/components/filters/ExpenseFilters";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import { useMe } from "@/shared/api/hooks/catalogs";
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
  ViewSettingsMenu,
  type ColumnVisibilityOption,
} from "@/shared/components/toolbar";
import type { ViewMode } from "@/shared/types/data-view";
import { Button } from "@/ui/button";
import { DropdownMenuItem } from "@/ui/dropdown-menu";
import { CARD_DETAIL_GROUP_OPTIONS } from "../../constants/filters";
import { CREDIT_CARD_STATUSES } from "../../constants/statuses";
import type { CardDetailGroupBy } from "../../constants/filters";

const SORT_OPTIONS = [
  { value: "date-desc", label: "Fecha: más reciente" },
  { value: "date-asc", label: "Fecha: más antigua" },
  { value: "amount-desc", label: "Monto: mayor a menor" },
  { value: "amount-asc", label: "Monto: menor a mayor" },
  { value: "description-asc", label: "Descripción: A–Z" },
] as const;

export interface CardDetailToolbarProps {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  shown: number;
  total: number;
  groupBy: CardDetailGroupBy[];
  onGroupByChange: (groupBy: CardDetailGroupBy[]) => void;
  sort?: string;
  onSortChange: (sort: string | undefined) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  fields: readonly ExpenseFilterKey[];
  columns: readonly ColumnVisibilityOption[];
  onResetView: () => void;
}

export function CardDetailToolbar({
  filters,
  onFiltersChange,
  shown,
  total,
  groupBy,
  onGroupByChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  fields,
  columns,
  onResetView,
}: CardDetailToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [showApplied, setShowApplied] = useState(false);
  const me = useMe();
  const filterCount = countActiveExpenseFilters(filters, fields);
  const appliedCount = filterCount + (sort ? 1 : 0) + groupBy.length;
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label;
  const visibleColumnCount = columns.filter((column) => column.visible).length;

  return (
    <div className="space-y-2">
      <ExpenseFilters
        fields={[...fields]}
        value={filters}
        onChange={onFiltersChange}
        statuses={CREDIT_CARD_STATUSES}
        shown={shown}
        total={total}
        personInPanel
        installmentsInPanel
        filterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        rightActions={
          <>
            <SortMenu
              value={sort}
              onChange={onSortChange}
              options={SORT_OPTIONS}
              align="start"
              trigger={
                <CountedToolbarButton
                  icon={<ArrowDownUp className="size-4" />}
                  label="Ordenar"
                  count={sort ? 1 : 0}
                  variant="ghost"
                  className="h-8 gap-1.5 text-muted-foreground"
                />
              }
            />
            <GroupingMenu
              value={groupBy}
              onChange={onGroupByChange}
              options={[...CARD_DETAIL_GROUP_OPTIONS]}
              multiple
              ordered
              maxSelected={2}
              align="start"
              trigger={
                <CountedToolbarButton
                  icon={<Layers className="size-4" />}
                  label="Agrupar"
                  count={groupBy.length}
                  variant="ghost"
                  className="h-8 gap-1.5 text-muted-foreground"
                />
              }
            />
            <AppliedViewToggle
              count={appliedCount}
              open={showApplied}
              onOpenChange={setShowApplied}
            />
            <span
              aria-hidden="true"
              className="mx-1 hidden h-5 w-px bg-border sm:block"
            />
            <ColumnVisibilityMenu
              columns={columns}
              align="end"
              trigger={
                <CountedToolbarButton
                  icon={<Columns3 className="size-4" />}
                  label={`Columnas ${visibleColumnCount}/${columns.length}`}
                  variant="ghost"
                  className="h-8 gap-1.5 text-muted-foreground"
                />
              }
            />
            <ViewSettingsMenu
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Ajustes de vista"
                  title="Ajustes de vista"
                  className="size-8 text-muted-foreground"
                >
                  <SlidersHorizontal className="size-4" />
                </Button>
              }
            >
              <DropdownMenuItem onSelect={onResetView}>
                Restablecer vista
              </DropdownMenuItem>
            </ViewSettingsMenu>
            <ViewModeToggle
              value={view}
              onChange={onViewChange}
              label="Diseño de movimientos"
            />
          </>
        }
        showActiveSummary={false}
        countLabel="movimientos"
      />

      {showApplied && appliedCount > 0 && (
        <AppliedViewSummary
          onAddFilter={() => setFilterOpen(true)}
          onReset={onResetView}
          resetDisabled={appliedCount === 0}
        >
          {sortLabel && (
            <AppliedSortChip
              label={sortLabel.split(":")[0]}
              descending={sort?.endsWith("desc") ?? false}
              onRemove={() => onSortChange(undefined)}
            />
          )}
          {groupBy.length > 0 && (
            <AppliedGroupChips
              value={groupBy}
              options={CARD_DETAIL_GROUP_OPTIONS}
              onChange={(next) =>
                onGroupByChange(next.slice(0, 2) as CardDetailGroupBy[])
              }
            />
          )}
          {filterCount > 0 && (
            <AppliedFilterSection label="Filtros">
              <ActiveExpenseFilterChips
                fields={[...fields]}
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
    </div>
  );
}
