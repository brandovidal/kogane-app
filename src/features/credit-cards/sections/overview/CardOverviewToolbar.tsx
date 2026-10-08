import { useState } from "react";
import {
  Activity,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  Table2,
} from "lucide-react";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { ExpensePersonFilter } from "@/features/expenses/components/filters/ExpensePersonFilter";
import { INSTALLMENT_FILTER_OPTIONS } from "@/features/expenses/constants/expense-filters";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { SearchField } from "@/shared/components/filters/SearchField";
import { Button } from "@/ui/button";
import { useMe } from "@/shared/api/hooks/catalogs";
import { cn } from "@/shared/utils/cn";
import { CardOverviewFilterSheet } from "./CardOverviewFilterSheet";

const FILTERS = [
  "person",
  "q",
  "installments",
  "category",
  "currency",
  "status",
  "type",
  "shared",
] as const;

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
          <ExpensePersonFilter
            compact
            value={filters.person}
            onChange={(person) => onFiltersChange({ ...filters, person })}
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
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setFilterOpen(true)}
          >
            <ListFilter className="size-4" />
            Filtros
          </Button>
          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px bg-border sm:block"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setShowApplied(!showApplied)}
            aria-expanded={showApplied}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform",
                showApplied && "rotate-90",
              )}
            />
            Ver aplicados
          </Button>
        </div>
        <div
          className="inline-flex shrink-0 rounded-lg border bg-card p-0.5"
          role="group"
          aria-label="Presentación de tarjetas"
        >
          <button
            type="button"
            onClick={() => onLayoutChange("table")}
            className={cn(
              "flex h-7 items-center gap-1 rounded-md px-2.5 text-sm",
              layout === "table"
                ? "bg-accent text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Table2 className="size-4" />
            Tabla
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange("cards")}
            className={cn(
              "flex h-7 items-center gap-1 rounded-md px-2.5 text-sm",
              layout === "cards"
                ? "bg-accent text-foreground"
                : "text-muted-foreground",
            )}
          >
            <LayoutGrid className="size-4" />
            Tarjetas
          </button>
        </div>
      </div>
      {showApplied && (
        <ActiveExpenseFilterChips
          fields={[...FILTERS]}
          value={filters}
          onChange={onFiltersChange}
          me={me}
        />
      )}
      <CardOverviewFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        fields={[...FILTERS].filter((field) => field !== "q")}
      />
    </>
  );
}
