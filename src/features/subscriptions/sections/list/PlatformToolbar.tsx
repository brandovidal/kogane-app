import { useState } from "react";
import type { Table } from "@tanstack/react-table";
import { Columns3, Layers, ListFilter, RotateCcw, SlidersHorizontal, UserRound } from "lucide-react";
import type { Subscription } from "@/shared/api/types";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { ExpenseFilterFields } from "@/features/expenses/components/filters/ExpenseFilterFields";
import { useExpensePersonOptions } from "@/features/expenses/hooks/useExpensePersonOptions";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import { PERSON_ALL } from "@/features/expenses/constants/expense-filters";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { SearchField } from "@/shared/components/filters/SearchField";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/ui/sheet";
import { PLATFORM_FILTER_KEYS } from "../../constants/platforms";
import { SUBSCRIPTION_STATUSES } from "../../constants/subscriptions";

export function PlatformToolbar({ filters, onFiltersChange, groupBy, onGroupByChange, table }: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  groupBy: "none" | "person" | "period";
  onGroupByChange: (group: "none" | "person" | "period") => void;
  table: Table<Subscription>;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const personOptions = useExpensePersonOptions();
  const activeFilters = countActiveExpenseFilters(filters, PLATFORM_FILTER_KEYS.filter((key) => key !== "q" && key !== "person"));
  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide());
  const visible = columns.filter((column) => column.getIsVisible()).length;
  return <>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div role="toolbar" aria-label="Herramientas de plataformas" className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <SearchField value={filters.q ?? ""} onChange={(q) => onFiltersChange({ ...filters, q: q || undefined })} placeholder="Buscar" shortcut="/" className="w-full sm:w-56" />
        <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <div className="flex items-center gap-1.5"><UserRound className="size-4 text-muted-foreground" /><span className="text-sm font-medium">Persona</span><FilterSelect label="Persona" value={filters.person ?? PERSON_ALL} options={personOptions} onChange={(person) => onFiltersChange({ ...filters, person })} allValue={PERSON_ALL} allLabel="Todos" width="w-32" searchable labelClassName="sr-only" /></div>
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={() => setFilterOpen(true)}><ListFilter className="size-4" />Filtros{activeFilters > 0 && <span className="text-xs font-semibold text-brand">{activeFilters}</span>}</Button>
        <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground"><Layers className="size-4" />Agrupar{groupBy !== "none" && <span className="text-xs font-semibold text-brand">1</span>}</Button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuLabel>Agrupar por</DropdownMenuLabel>{([ ["none", "Sin agrupar"], ["person", "Persona"], ["period", "Período"] ] as const).map(([value, label]) => <DropdownMenuCheckboxItem key={value} checked={groupBy === value} onCheckedChange={() => onGroupByChange(value)}>{label}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>
        {(filters.q || filters.person || activeFilters > 0 || groupBy !== "none") && <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground" onClick={() => { onFiltersChange({}); onGroupByChange("none"); }}><RotateCcw className="size-3.5" />Restablecer</Button>}
      </div>
      <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5"><SlidersHorizontal className="size-4" /><span className="hidden sm:inline">Ajustes</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel>Columnas visibles</DropdownMenuLabel><DropdownMenuSeparator />{columns.map((column) => <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onSelect={(event) => event.preventDefault()} onCheckedChange={(checked) => column.toggleVisibility(checked)}><Columns3 className="size-3.5" />{column.columnDef.meta?.label ?? column.id}</DropdownMenuCheckboxItem>)}<DropdownMenuSeparator /><DropdownMenuLabel className="text-xs text-muted-foreground">{visible} de {columns.length} columnas</DropdownMenuLabel></DropdownMenuContent></DropdownMenu>
    </div>
    <Sheet open={filterOpen} onOpenChange={setFilterOpen}><SheetContent side="right" className="w-[min(24rem,calc(100vw-1rem))] overflow-hidden"><SheetHeader className="pr-10"><SheetTitle>Filtros</SheetTitle><SheetDescription>Filtra las plataformas de este período.</SheetDescription></SheetHeader><div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4"><ExpenseFilterFields fields={PLATFORM_FILTER_KEYS.filter((key) => key !== "q")} value={filters} onChange={onFiltersChange} statuses={SUBSCRIPTION_STATUSES} panel personInPanel /></div><SheetFooter className="border-t p-4"><Button type="button" variant="outline" size="sm" className="mr-auto" onClick={() => onFiltersChange({ q: filters.q })}>Limpiar filtros</Button><Button type="button" size="sm" onClick={() => setFilterOpen(false)}>Ver resultados</Button></SheetFooter></SheetContent></Sheet>
  </>;
}
