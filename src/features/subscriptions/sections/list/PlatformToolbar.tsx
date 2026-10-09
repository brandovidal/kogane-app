import type { Table } from "@tanstack/react-table";
import {
  Columns3,
  Eye,
  Layers,
  Link2,
  ListFilter,
  RotateCcw,
  SlidersHorizontal,
  Table2,
  LayoutGrid,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { toast } from "sonner";
import type { Subscription } from "@/shared/api/types";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { SearchField } from "@/shared/components/filters/SearchField";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { PLATFORM_FILTER_KEYS } from "../../constants/platforms";
import { countPlatformFilters } from "../../lib/platform-filters";
import type { PlatformView } from "./PlatformViewBar";

export function PlatformToolbar({
  filters,
  onFiltersChange,
  groupBy,
  onGroupByChange,
  view,
  onViewChange,
  table,
  onOpenFilters,
}: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  groupBy: Array<"person" | "period">;
  onGroupByChange: (group: Array<"person" | "period">) => void;
  view: PlatformView;
  onViewChange: (view: PlatformView) => void;
  table: Table<Subscription>;
  onOpenFilters: () => void;
}) {
  const activeFilters = countPlatformFilters(
    filters,
    PLATFORM_FILTER_KEYS.filter((key) => key !== "q" && key !== "person"),
  );
  const sheetFilterCount = countPlatformFilters(filters, PLATFORM_FILTER_KEYS);
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());
  const visible = columns.filter((column) => column.getIsVisible()).length;
  const resetView = () => {
    onFiltersChange({});
    onGroupByChange([]);
    onViewChange("list");
    table.resetColumnVisibility();
  };
  const copyViewLink = () =>
    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Enlace copiado"))
      .catch(() => toast.error("No se pudo copiar el enlace"));
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={onOpenFilters}
          >
            <ListFilter className="size-4" />
            Filtros
            {activeFilters > 0 && (
              <span className="text-xs font-semibold text-brand">
                {activeFilters}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground"
              >
                <Layers className="size-4" />
                Agrupar
                {groupBy.length > 0 && (
                  <span className="text-xs font-semibold text-brand">
                    {groupBy.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Agrupar por (en orden)</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={!groupBy.length}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => onGroupByChange([])}
              >
                Sin agrupar
              </DropdownMenuCheckboxItem>
              {(
                [
                  ["period", "Período"],
                  ["person", "Persona"],
                ] as const
              ).map(([value, label]) => {
                const position = groupBy.indexOf(value);
                return (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={position >= 0}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) =>
                      onGroupByChange(
                        checked
                          ? [...groupBy, value]
                          : groupBy.filter((field) => field !== value),
                      )
                    }
                  >
                    {label}
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
          {(filters.q ||
            filters.person ||
            activeFilters > 0 ||
            groupBy.length > 0) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              onClick={() => {
                onFiltersChange({});
                onGroupByChange([]);
              }}
            >
              <RotateCcw className="size-3.5" />
              Restablecer
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
            >
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Ajustes</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Ajustes de vista</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Diseño
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={view}
              onValueChange={(next) => onViewChange(next as PlatformView)}
            >
              {(
                [
                  ["list", "Lista", Table2],
                  ["cards", "Tarjetas", LayoutGrid],
                  ["period", "Por período", Columns3],
                  ["calendar", "Calendario", CalendarDays],
                ] as const
              ).map(([value, label, Icon]) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  onSelect={(event) => event.preventDefault()}
                >
                  <Icon className="size-4" />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Eye className="size-4" />
                Columnas visibles
                <span className="ml-auto text-xs text-muted-foreground">
                  {visible}/{columns.length}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-[min(70vh,32rem)] w-60 overflow-y-auto">
                <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
                {columns.map((column) => (
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
                  checked={visible === columns.length}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={() =>
                    columns.forEach((column) => column.toggleVisibility(true))
                  }
                >
                  Mostrar todas
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onSelect={onOpenFilters}>
              <ListFilter className="size-4" />
              Filtros
              {sheetFilterCount > 0 && (
                <span className="ml-auto text-xs text-brand">
                  {sheetFilterCount}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Layers className="size-4" />
                Agrupar
                <span className="ml-auto max-w-32 truncate text-xs text-muted-foreground">
                  {groupBy
                    .map((field) =>
                      field === "period" ? "Período" : "Persona",
                    )
                    .join(" › ") || "Sin agrupar"}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>Agrupar por (en orden)</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={!groupBy.length}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={() => onGroupByChange([])}
                >
                  Sin agrupar
                </DropdownMenuCheckboxItem>
                {(
                  [
                    ["period", "Período"],
                    ["person", "Persona"],
                  ] as const
                ).map(([field, label]) => (
                  <DropdownMenuCheckboxItem
                    key={field}
                    checked={groupBy.includes(field)}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) =>
                      onGroupByChange(
                        checked
                          ? [...groupBy, field]
                          : groupBy.filter((item) => item !== field),
                      )
                    }
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <CalendarRange className="size-4" />
              Color condicional
              <span className="ml-auto text-[10px] text-muted-foreground">
                Próximamente
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Columns3 className="size-4" />
              Totales del pie
              <span className="ml-auto text-[10px] text-muted-foreground">
                Próximamente
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={copyViewLink}>
              <Link2 className="size-4" />
              Copiar enlace a la vista
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <RotateCcw className="size-4" />
              Guardar como nueva vista
              <span className="ml-auto text-[10px] text-muted-foreground">
                Próximamente
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={resetView}>
              <RotateCcw className="size-4" />
              Restablecer vista
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
