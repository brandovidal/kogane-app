import { CalendarPlus, ListFilter, Plus, SearchX } from "lucide-react";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";
import type { ViewMode } from "@/shared/types/data-view";
import { FIXED_COST_FILTER_KEYS } from "../../lib/fixed-cost-filters";

const FILTER_FIELDS = FIXED_COST_FILTER_KEYS.filter(
  (key) => key !== "month" && key !== "year",
);

export function FixedCostEmptyState({
  view,
  kind,
  filters,
  me,
  periodLabel,
  periodCount,
  titleOverride,
  descriptionOverride,
  onFiltersChange,
  onOpenFilters,
  onClearFilters,
  onClearSearch,
  onSearchAllMonths,
  onCreate,
}: {
  view: ViewMode;
  kind: "period" | "filters" | "search";
  filters: ExpenseFilterValues;
  me?: string;
  periodLabel: string;
  periodCount: number;
  titleOverride?: string;
  descriptionOverride?: string;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  onOpenFilters: () => void;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onSearchAllMonths: () => void;
  onCreate: () => void;
}) {
  const search = filters.q?.trim();
  const isSearch = kind === "search";
  const isFilters = kind === "filters";
  const Icon = isSearch ? SearchX : isFilters ? ListFilter : CalendarPlus;
  const title =
    titleOverride ??
    (isSearch
      ? `Sin resultados para “${search}”`
      : isFilters
        ? "Ningún costo coincide"
        : `Sin costos fijos en ${periodLabel}`);
  const description =
    descriptionOverride ??
    (isSearch
      ? "Revisa la búsqueda o amplía el período para encontrar este costo."
      : isFilters
        ? `Hay ${periodCount} ${periodCount === 1 ? "costo en este período" : "costos en este período"}, pero ninguno coincide con los filtros aplicados.`
        : "Todavía no hay costos registrados en este período. Puedes crear uno para empezar.");

  return (
    <section
      data-view={view}
      aria-label={title}
      className={cn(
        "flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card/40 px-5 py-10 text-center sm:px-8",
        view === "cards" && "col-span-full min-h-72",
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      {isFilters && (
        <div className="max-w-full rounded-xl border border-border/70 bg-background/40 px-3 py-2">
          <ActiveExpenseFilterChips
            fields={FILTER_FIELDS}
            value={filters}
            onChange={(next) =>
              onFiltersChange({
                ...next,
                month: filters.month,
                year: filters.year,
              })
            }
            me={me}
            tone="brand"
            collapsible={false}
            showClearAll={false}
          />
        </div>
      )}

      <div className="mt-1 flex flex-wrap justify-center gap-2">
        {isSearch ? (
          <>
            <Button type="button" variant="outline" onClick={onClearSearch}>
              Limpiar búsqueda
            </Button>
            <Button type="button" variant="outline" onClick={onSearchAllMonths}>
              Buscar en todos los meses
            </Button>
          </>
        ) : isFilters ? (
          <>
            <Button type="button" variant="outline" onClick={onOpenFilters}>
              <ListFilter className="size-4" /> Editar filtros
            </Button>
            <Button type="button" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          </>
        ) : (
          <Button type="button" onClick={onCreate}>
            <Plus className="size-4" /> Crear costo fijo
          </Button>
        )}
      </div>
    </section>
  );
}
