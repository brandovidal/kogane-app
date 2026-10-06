import { useState } from "react";
import { Activity, ChevronRight, LayoutGrid, ListFilter, Table2, UserRound } from "lucide-react";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { ExpenseFilterFields } from "@/features/expenses/components/filters/ExpenseFilterFields";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { useExpensePersonOptions } from "@/features/expenses/hooks/useExpensePersonOptions";
import { PERSON_ALL, INSTALLMENT_FILTER_OPTIONS } from "@/features/expenses/constants/expense-filters";
import { CREDIT_CARD_STATUSES } from "../../constants/statuses";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { SearchField } from "@/shared/components/filters/SearchField";
import { Button } from "@/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/ui/sheet";
import { useMe } from "@/shared/api/hooks/catalogs";
import { cn } from "@/shared/utils/cn";

const FILTERS = ["person", "q", "installments", "category", "currency", "status", "type", "shared"] as const;

export function CardOverviewToolbar({ filters, onFiltersChange, layout, onLayoutChange }: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  layout: "cards" | "table";
  onLayoutChange: (layout: "cards" | "table") => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [showApplied, setShowApplied] = useState(false);
  const people = useExpensePersonOptions();
  const me = useMe();
  return <>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2" role="toolbar" aria-label="Herramientas de tarjetas">
        <SearchField value={filters.q ?? ""} onChange={(q) => onFiltersChange({ ...filters, q: q || undefined })} placeholder="Buscar" shortcut="/" className="w-full sm:w-44" />
        <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <div className="flex items-center gap-1.5"><UserRound className="size-4 text-muted-foreground" /><span className="text-sm font-medium">Persona</span><FilterSelect label="Persona" value={filters.person ?? PERSON_ALL} options={people} onChange={(person) => onFiltersChange({ ...filters, person })} allValue={PERSON_ALL} allLabel="Todos" width="w-24" searchable labelClassName="sr-only" /></div>
        <div className="flex items-center gap-1.5"><Activity className="size-4 text-muted-foreground" /><span className="text-sm font-medium">Cuota</span><FilterSelect label="Cuota" value={filters.installments} options={INSTALLMENT_FILTER_OPTIONS} onChange={(installments) => onFiltersChange({ ...filters, installments: installments as ExpenseFilterValues["installments"] })} allLabel="Todos" width="w-24" labelClassName="sr-only" /></div>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={() => setFilterOpen(true)}><ListFilter className="size-4" />Filtros</Button>
        <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setShowApplied(!showApplied)} aria-expanded={showApplied}><ChevronRight className={cn("size-4 transition-transform", showApplied && "rotate-90")} />Ver aplicados</Button>
      </div>
      <div className="inline-flex shrink-0 rounded-lg border bg-card p-0.5" role="group" aria-label="Presentación de tarjetas"><button type="button" onClick={() => onLayoutChange("table")} className={cn("flex h-7 items-center gap-1 rounded-md px-2.5 text-sm", layout === "table" ? "bg-accent text-foreground" : "text-muted-foreground")}><Table2 className="size-4" />Tabla</button><button type="button" onClick={() => onLayoutChange("cards")} className={cn("flex h-7 items-center gap-1 rounded-md px-2.5 text-sm", layout === "cards" ? "bg-accent text-foreground" : "text-muted-foreground")}><LayoutGrid className="size-4" />Tarjetas</button></div>
    </div>
    {showApplied && <ActiveExpenseFilterChips fields={[...FILTERS]} value={filters} onChange={onFiltersChange} me={me} />}
    <Sheet open={filterOpen} onOpenChange={setFilterOpen}><SheetContent side="right" className="w-[min(24rem,calc(100vw-1rem))] overflow-hidden"><SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader><div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4"><ExpenseFilterFields fields={[...FILTERS].filter((field) => field !== "q")} value={filters} onChange={onFiltersChange} statuses={CREDIT_CARD_STATUSES} panel personInPanel /></div><SheetFooter className="border-t p-4"><Button variant="outline" size="sm" className="mr-auto" onClick={() => onFiltersChange({ q: filters.q })}>Limpiar filtros</Button><Button size="sm" onClick={() => setFilterOpen(false)}>Ver resultados</Button></SheetFooter></SheetContent></Sheet>
  </>;
}
