import { useState } from "react";
import { toast } from "sonner";
import type { Table } from "@tanstack/react-table";
import {
  ArrowDownUp,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Columns3,
  KanbanSquare,
  Layers,
  LayoutGrid,
  ListChecks,
  ListFilter,
  CalendarDays,
  Clock,
  Plus,
  ReceiptText,
  SlidersHorizontal,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { ExpenseFilterFields } from "@/features/expenses/components/filters/ExpenseFilterFields";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import type { FixedCost } from "@/shared/api/types";
import { SearchField } from "@/shared/components/filters/SearchField";
import {
  ExportMenu,
  type ExportMenuItem,
} from "@/shared/components/toolbar/ExportMenu";
import { newExpenseStore } from "@/features/new-expense/stores/new-expense.store";
import type { ViewMode } from "@/shared/types/data-view";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
import { FixedCostPeriodSelector } from "../../components/header/FixedCostPeriodSelector";
import { FIXED_COST_STATUSES } from "../../constants/statuses";
import {
  FIXED_COST_FILTER_KEYS,
  FIXED_COST_GROUP_LABELS,
  FIXED_COST_GROUP_OPTIONS,
} from "../../lib/fixed-cost-filters";
import {
  FIXED_COST_SORTS,
  FIXED_COST_VIEWS,
  type FixedCostView,
  findFixedCostSort,
} from "../../lib/fixed-cost-views";
import type { FixedCostGroupBy } from "../../types/fixed-cost-types";

const VIEW_ICONS: Record<FixedCostView, typeof CalendarDays> = {
  mes: CalendarDays,
  "por-pagar": Clock,
  cuotas: ListChecks,
  estado: KanbanSquare,
  todos: Table2,
};

/** Saved views on the left, at the height of "Crear". */
export function FixedCostViewBar({
  page,
  onPageChange,
  exportItems,
  onCreate,
}: {
  page: FixedCostView;
  onPageChange: (page: FixedCostView) => void;
  exportItems: ExportMenuItem[];
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-1">
        <div
          role="tablist"
          aria-label="Vistas"
          className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 pb-1 sm:pb-0 [scrollbar-width:none]"
        >
          {FIXED_COST_VIEWS.map((view) => {
            const Icon = VIEW_ICONS[view.value];
            const active = view.value === page;
            return (
              <button
                key={view.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onPageChange(view.value)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-accent text-foreground ring-1 ring-border/70",
                )}
              >
                <Icon className="size-4" />
                {view.label}
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Más vistas: próximamente"
          aria-label="Más vistas, próximamente"
          className="rounded-sm border border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          onClick={() =>
            toast.info(
              "La creación de vistas personalizadas estará disponible próximamente.",
            )
          }
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2">
        <ExportMenu items={exportItems} label="Más opciones" iconOnly />
        <div className="inline-flex items-center">
          <Button
            type="button"
            size="sm"
            className="fixed-costs-create-button h-9 gap-1 rounded-l-sm rounded-r-none px-4"
            onClick={onCreate}
            aria-label="Crear costo fijo"
          >
            <Plus className="size-4" />
            Crear
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="fixed-costs-create-button fixed-costs-create-menu-button h-9 w-9 rounded-l-none rounded-r-sm border-l"
                aria-label="Más opciones para crear"
              >
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem onSelect={onCreate}>
                <CalendarDays className="size-4" />
                Costo fijo
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  newExpenseStore.getState().openWith({ destination: "daily" })
                }
              >
                <ReceiptText className="size-4" />
                Gasto general
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

const PERIOD_KEYS = new Set(["month", "year"]);
const panelFields = FIXED_COST_FILTER_KEYS.filter(
  (key) => !PERIOD_KEYS.has(key) && key !== "q",
);

function ToolbarButton({
  icon: Icon,
  label,
  count,
  active,
  ...props
}: React.ComponentProps<typeof Button> & {
  icon: typeof SlidersHorizontal;
  label: string;
  count?: number | string;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 gap-1.5 rounded-sm border border-transparent px-2 text-muted-foreground hover:border-border/60 hover:text-foreground",
        active && "border-border/70 bg-accent text-foreground",
      )}
      {...props}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
      {count != null && count !== 0 && (
        <span className="text-xs font-semibold tabular-nums text-brand">
          {count}
        </span>
      )}
    </Button>
  );
}

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
}

/**
 * The tools of the table, right above it: search, filters, sort, group and the
 * applied ones behind "Ver aplicados"; columns and table/cards on the right.
 */
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
}: FixedCostToolbarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showApplied, setShowApplied] = useState(false);
  const filterCount = countActiveExpenseFilters(filters, panelFields);
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
  const filtersWithoutPeriod = {
    ...filters,
    month: undefined,
    year: undefined,
  };
  const clearFilters = () =>
    onFiltersChange({ month: filters.month, year: filters.year, q: filters.q });

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
          <ToolbarButton
            icon={ListFilter}
            label="Filtros"
            count={filterCount}
            onClick={() => setSheetOpen(true)}
          />
          {canSort && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToolbarButton
                  icon={ArrowDownUp}
                  label="Ordenar"
                  count={sortOption ? 1 : 0}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={sort ?? ""}
                  onValueChange={(next) => onSortChange(next || undefined)}
                >
                  <DropdownMenuRadioItem value="">
                    Orden original
                  </DropdownMenuRadioItem>
                  {FIXED_COST_SORTS.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {canGroup && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToolbarButton
                  icon={Layers}
                  label="Agrupar"
                  count={groupBy.length}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Agrupar por (en orden)</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={!groupBy.length}
                  onCheckedChange={() => onGroupByChange([])}
                >
                  Sin agrupar
                </DropdownMenuCheckboxItem>
                {FIXED_COST_GROUP_OPTIONS.map((option) => {
                  const field = option.value as FixedCostGroupBy[number];
                  const position = groupBy.indexOf(field);
                  return (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={position >= 0}
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(checked) =>
                        onGroupByChange(
                          checked
                            ? [...groupBy, field]
                            : groupBy.filter((item) => item !== field),
                        )
                      }
                    >
                      {option.label}
                      {position >= 0 && groupBy.length > 1 && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {position + 1}°
                        </span>
                      )}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {appliedCount > 0 && (
            <>
              <span
                aria-hidden="true"
                className="mx-1 hidden h-5 w-px bg-border sm:block"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-expanded={showApplied}
                onClick={() => setShowApplied(!showApplied)}
                className={cn(
                  "h-8 gap-1 px-2 text-xs text-muted-foreground",
                  showApplied && "bg-accent text-foreground",
                )}
              >
                {showApplied ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
                {showApplied ? "Ocultar aplicados" : "Ver aplicados"}
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {table && hideable.length > 0 && view === "table" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToolbarButton
                  icon={Columns3}
                  label="Columnas"
                  count={`${visible}/${hideable.length}`}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hideable.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(checked)
                    }
                  >
                    {column.columnDef.meta?.label ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={visible === hideable.length}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={() =>
                    hideable.forEach((column) => column.toggleVisibility(true))
                  }
                >
                  Mostrar todas
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Configurar filtros"
            title="Configurar filtros"
            onClick={() => setSheetOpen(true)}
            className="size-8 rounded-md text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
          {canChangeLayout && (
            <div
              role="radiogroup"
              aria-label="Diseño"
              className="flex items-center gap-0.5 rounded-sm border border-border/80 p-0.5"
            >
              {(
                [
                  ["table", "Tabla", Table2],
                  ["cards", "Tarjetas", LayoutGrid],
                ] as const
              ).map(([mode, label, Icon]) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={view === mode}
                  onClick={() => onViewChange(mode)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    view === mode &&
                      "bg-accent text-foreground ring-1 ring-border/70",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showApplied && appliedCount > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-sm border border-dashed px-3 py-2">
          {sortOption && (
            <div className="flex items-center gap-2 border-r pr-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Orden
              </span>
              <span className="inline-flex h-6 items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 text-xs font-medium text-brand">
                {sortOption.desc ? (
                  <ArrowDown className="size-3.5" />
                ) : (
                  <ArrowUp className="size-3.5" />
                )}
                {sortOption.label.split(":")[0]}
                <button
                  type="button"
                  aria-label="Quitar orden"
                  onClick={() => onSortChange(undefined)}
                  className="inline-flex size-4 items-center justify-center rounded-full hover:bg-brand/20"
                >
                  <X className="size-3" />
                </button>
              </span>
            </div>
          )}
          {groupBy.length > 0 && (
            <div className="flex items-center gap-2 border-r pr-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Agrupar
              </span>
              <ActiveExpenseFilterChips
                fields={[]}
                value={filtersWithoutPeriod}
                onChange={() => undefined}
                groupBy={groupBy}
                onGroupByChange={onGroupByChange}
                groupByLabels={FIXED_COST_GROUP_LABELS}
                tone="brand"
                collapsible={false}
                showClearAll={false}
              />
            </div>
          )}
          {filterCount > 0 && (
            <div className="flex min-w-0 items-center gap-2 border-r pr-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Filtros
              </span>
              <ActiveExpenseFilterChips
                fields={panelFields}
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
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 shrink-0 gap-1 text-muted-foreground"
            onClick={() => setSheetOpen(true)}
          >
            <Plus className="size-3.5" /> Filtro
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="ml-auto h-7 shrink-0 text-muted-foreground"
            disabled={!hasViewSettings}
            onClick={onResetView}
          >
            Restablecer vista
          </Button>
        </div>
      )}

      <FixedCostFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        me={me}
        shown={shown}
        total={total}
        filterCount={filterCount}
        onClear={clearFilters}
        showPeriod={showPeriodInFilters}
      />
    </div>
  );
}

function FixedCostFilterSheet({
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
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[min(26rem,calc(100vw-1rem))] flex-col gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="gap-2 border-b p-5 pr-12">
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
            fields={panelFields}
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
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          {showPeriod && (
            <section className="space-y-2">
              <h3 className="eyebrow">Período</h3>
              <FixedCostPeriodSelector />
            </section>
          )}
          <section className="space-y-3">
            <h3 className="eyebrow">Filtros</h3>
            <div className="flex flex-col gap-3">
              <ExpenseFilterFields
                fields={panelFields}
                value={filters}
                onChange={onFiltersChange}
                statuses={FIXED_COST_STATUSES}
                panel
                personInPanel
              />
            </div>
          </section>
        </div>
        <SheetFooter className="flex-row items-center justify-between border-t bg-background p-4">
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
