import { useEffect, useState } from "react";
import type { Table } from "@tanstack/react-table";
import {
  ArrowDownUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Eye,
  Layers,
  LayoutGrid,
  Link2,
  ListFilter,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Table2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { ExpenseFilterFields } from "@/features/expenses/components/filters/ExpenseFilterFields";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import type { FixedCost } from "@/shared/api/types";
import { SearchField } from "@/shared/components/filters/SearchField";
import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
import { FixedCostPeriodSelector } from "../../components/header/FixedCostPeriodSelector";
import { FIXED_COST_STATUSES } from "../../constants/statuses";
import {
  FIXED_COST_PANEL_FILTER_KEYS,
  FIXED_COST_GROUP_LABELS,
  FIXED_COST_GROUP_OPTIONS,
} from "../../lib/fixed-cost-filters";
import {
  FIXED_COST_SORTS,
  findFixedCostSort,
} from "../../lib/fixed-cost-views";
import type { FixedCostGroupBy } from "../../types/fixed-cost-types";

interface FixedCostMobileViewSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  me?: string;
  shown: number;
  groupBy: FixedCostGroupBy;
  onGroupByChange: (groupBy: FixedCostGroupBy) => void;
  sort?: string;
  onSortChange: (sort: string | undefined) => void;
  onResetView: () => void;
  view: "table" | "cards";
  onViewChange: (view: "table" | "cards") => void;
  table?: Table<FixedCost>;
  canGroup: boolean;
  canSort: boolean;
  canChangeLayout: boolean;
  showPeriodInFilters: boolean;
  filterCount: number;
  personCounts: Record<string, number>;
  clearFilters: () => void;
  hasViewSettings: boolean;
}

export function FixedCostMobileViewSettings({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  me,
  shown,
  groupBy,
  onGroupByChange,
  sort,
  onSortChange,
  onResetView,
  view,
  onViewChange,
  table,
  canGroup,
  canSort,
  canChangeLayout,
  showPeriodInFilters,
  filterCount,
  personCounts,
  clearFilters,
  hasViewSettings,
}: FixedCostMobileViewSettingsProps) {
  const [settingsSection, setSettingsSection] = useState<
    "overview" | "columns" | "filters" | "group" | "sort"
  >("overview");
  const [columnSearch, setColumnSearch] = useState("");
  useEffect(() => {
    if (open) setSettingsSection("overview");
  }, [open]);
  const hideable =
    table?.getAllLeafColumns().filter((column) => column.getCanHide()) ?? [];
  const visible = hideable.filter((column) => column.getIsVisible()).length;
  const sortOption = findFixedCostSort(sort);
  const settingsSectionTitle = {
    overview: "Ajustes de vista",
    columns: "Columnas visibles",
    filters: "Filtros",
    group: "Agrupar",
    sort: "Orden",
  }[settingsSection];
  const settingsRow = (
    icon: typeof SlidersHorizontal,
    label: string,
    detail: string,
    onClick: () => void,
    disabled = false,
  ) => {
    const Icon = icon;
    return (
      <button
        key={label}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex min-h-10 w-full items-center gap-3 rounded-md px-2 text-left text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="max-w-36 truncate text-xs text-muted-foreground">
          {detail}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (open) setSettingsSection("overview");
      }}
    >
      <SheetContent
        side="right"
        className="flex w-[min(26rem,calc(100vw-1rem))] flex-col gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="border-b p-5 pr-12">
          <div className="flex items-center gap-2">
            {settingsSection !== "overview" && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Volver a ajustes de vista"
                onClick={() => setSettingsSection("overview")}
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
            <SheetTitle>{settingsSectionTitle}</SheetTitle>
          </div>
          <SheetDescription>
            Configura cómo se muestran los costos fijos en esta vista.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {settingsSection === "overview" && (
            <>
              {canChangeLayout && (
                <section className="space-y-2">
                  <h3 className="eyebrow">Diseño</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["table", "Tabla", Table2],
                        ["cards", "Tarjetas", LayoutGrid],
                      ] as const
                    ).map(([mode, label, Icon]) => (
                      <Button
                        key={mode}
                        type="button"
                        variant={view === mode ? "secondary" : "outline"}
                        aria-pressed={view === mode}
                        onClick={() => onViewChange(mode)}
                        className="justify-start gap-2"
                      >
                        <Icon className="size-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-1">
                <h3 className="eyebrow px-2 pb-1">Ajustes</h3>
                {table &&
                  hideable.length > 0 &&
                  settingsRow(
                    Eye,
                    "Columnas visibles",
                    `${visible} de ${hideable.length}`,
                    () => setSettingsSection("columns"),
                  )}
                {settingsRow(
                  ListFilter,
                  "Filtros",
                  filterCount ? `${filterCount} activos` : "Ninguno",
                  () => setSettingsSection("filters"),
                )}
                {canSort &&
                  settingsRow(
                    ArrowDownUp,
                    "Orden",
                    sortOption ? sortOption.label : "Predeterminado",
                    () => setSettingsSection("sort"),
                  )}
                {canGroup &&
                  settingsRow(
                    Layers,
                    "Agrupar",
                    groupBy.length
                      ? groupBy
                          .map((field) => FIXED_COST_GROUP_LABELS[field])
                          .join(" › ")
                      : "Sin agrupar",
                    () => setSettingsSection("group"),
                  )}
                {settingsRow(
                  SlidersHorizontal,
                  "Color condicional",
                  "Próximamente",
                  () => {},
                  true,
                )}
                {settingsRow(
                  Columns3,
                  "Totales del pie",
                  "Próximamente",
                  () => {},
                  true,
                )}
              </section>

              <div className="space-y-1 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() =>
                    void navigator.clipboard
                      .writeText(window.location.href)
                      .then(() => toast.success("Enlace copiado"))
                      .catch(() => toast.error("No se pudo copiar el enlace"))
                  }
                >
                  <Link2 className="size-4" />
                  Copiar enlace a la vista
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() =>
                    toast.info(
                      "Guardar vistas personalizadas estará disponible próximamente.",
                    )
                  }
                >
                  <Plus className="size-4" />
                  Guardar como nueva vista
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!hasViewSettings}
                  onClick={() => {
                    onResetView();
                    onOpenChange(false);
                  }}
                  className="w-full justify-start gap-2 text-muted-foreground"
                >
                  <RotateCcw className="size-4" />
                  Restablecer vista
                </Button>
              </div>
            </>
          )}

          {settingsSection === "columns" && table && (
            <>
              <SearchField
                placeholder="Buscar columna..."
                value={columnSearch}
                onChange={setColumnSearch}
              />
              <h3 className="eyebrow">Columnas visibles</h3>
              {hideable
                .filter((column) =>
                  (column.columnDef.meta?.label ?? column.id)
                    .toLowerCase()
                    .includes(columnSearch.trim().toLowerCase()),
                )
                .map((column) => (
                  <label
                    key={column.id}
                    className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md px-2 text-sm hover:bg-accent"
                  >
                    <span>{column.columnDef.meta?.label ?? column.id}</span>
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={(event) =>
                        column.toggleVisibility(event.target.checked)
                      }
                      aria-label={`Mostrar columna ${column.columnDef.meta?.label ?? column.id}`}
                      className="size-4 accent-brand"
                    />
                  </label>
                ))}
              <div className="flex justify-between border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    hideable.forEach((column) => column.toggleVisibility(true))
                  }
                >
                  Mostrar todas
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    hideable.forEach((column) => column.toggleVisibility(false))
                  }
                >
                  Ocultar todas
                </Button>
              </div>
            </>
          )}

          {settingsSection === "filters" && (
            <>
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
              {showPeriodInFilters && (
                <section className="space-y-2">
                  <h3 className="eyebrow">Período</h3>
                  <FixedCostPeriodSelector />
                </section>
              )}
              <section className="space-y-3">
                <h3 className="eyebrow">Filtros disponibles</h3>
                <ExpenseFilterFields
                  fields={FIXED_COST_PANEL_FILTER_KEYS}
                  value={filters}
                  onChange={onFiltersChange}
                  statuses={FIXED_COST_STATUSES}
                  panel
                  personInPanel
                  personCounts={personCounts}
                />
              </section>
              <div className="flex justify-between border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={filterCount === 0}
                  onClick={clearFilters}
                >
                  <Trash2 className="size-4" />
                  Limpiar filtros
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Ver {shown} {shown === 1 ? "resultado" : "resultados"}
                </Button>
              </div>
            </>
          )}

          {settingsSection === "group" && (
            <>
              <label className="flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-accent">
                <input
                  type="checkbox"
                  checked={!groupBy.length}
                  onChange={() => onGroupByChange([])}
                  className="size-4 accent-brand"
                />
                Sin agrupar
              </label>
              {FIXED_COST_GROUP_OPTIONS.map((option) => {
                const field = option.value as FixedCostGroupBy[number];
                return (
                  <label
                    key={option.value}
                    className="flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={groupBy.includes(field)}
                      onChange={(event) =>
                        onGroupByChange(
                          event.target.checked
                            ? [...groupBy, field]
                            : groupBy.filter((item) => item !== field),
                        )
                      }
                      className="size-4 accent-brand"
                    />
                    {option.label}
                  </label>
                );
              })}
            </>
          )}

          {settingsSection === "sort" && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onSortChange(undefined)}
                className={cn(
                  "flex min-h-10 w-full items-center rounded-md px-2 text-left text-sm hover:bg-accent",
                  !sortOption && "bg-accent font-medium",
                )}
              >
                Orden original
              </button>
              {FIXED_COST_SORTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  className={cn(
                    "flex min-h-10 w-full items-center justify-between rounded-md px-2 text-left text-sm hover:bg-accent",
                    sort === option.value && "bg-accent font-medium",
                  )}
                >
                  {option.label}
                  {sort === option.value && (
                    <Check aria-hidden="true" className="size-4 text-brand" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
