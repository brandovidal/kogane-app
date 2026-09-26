import { useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";

import { useHistory, type HistoryFilter } from "@/shared/api/hooks/history";
import { EmptyState } from "@/shared/components/EmptyState";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/ui/sheet";

import { ENTITY_LABELS, SOURCE_LABELS } from "../history-view";
import { HistoryTimeline } from "./HistoryTimeline";

const ALL = "__all__";
const ENTITIES = Object.keys(ENTITY_LABELS);
const MODULES = [
  { key: "expenses", label: "Gastos", entities: ["exp_daily_expenses", "exp_fixed_costs", "exp_subscriptions", "exp_credit_card_expenses", "exp_recurring_expenses"] },
  { key: "debts", label: "Cobros y deudas", entities: ["exp_debts", "exp_debt_payments"] },
  { key: "commitments", label: "Préstamos e inversiones", entities: ["exp_commitments", "exp_contributions"] },
  { key: "budget", label: "Presupuesto", entities: ["bud_monthly_budgets", "bud_budget_groups", "bud_category_budgets", "bud_incomes", "bud_settings"] },
  { key: "settings", label: "Configuración", entities: ["cat_people", "cat_payment_methods", "cat_card_holders", "cat_categories", "ntf_settings"] },
  { key: "imports", label: "Reconocimiento / importación", entities: ["imp_batches", "imp_statements"] },
] as const;
const KEYS = ["module", "entity", "source", "from", "to", "page"] as const;
type HistoryFilters = Partial<Record<(typeof KEYS)[number], string>>;

// Configuración ▸ Historial: every change, paginated; the filters go in a side panel and stay in the URL (D98)
export function HistoryPanel() {
  const [filters, setFilters] = useUrlFilters<HistoryFilters>([...KEYS]);
  const [open, setOpen] = useState(false);
  const page = Math.max(Number(filters.page) || 1, 1);
  const query: HistoryFilter = {
    module: filters.module as HistoryFilter["module"],
    entity: filters.entity,
    source: filters.source as HistoryFilter["source"],
    from: filters.from,
    to: filters.to,
    page,
  };
  const { data, isLoading, isError } = useHistory(query);
  const active = Number(Boolean(filters.module || filters.entity)) + ["source", "from", "to"].filter((key) => filters[key as keyof HistoryFilters]).length;
  const set = (key: keyof HistoryFilters, value: string | undefined) => setFilters({ ...filters, [key]: value || undefined, page: undefined });
  const pages = data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1;
  const selectedModule = MODULES.find((module) => module.key === filters.module);
  const screens = selectedModule?.entities ?? ENTITIES;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Filtros{active > 0 ? ` (${active})` : ""}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-sm">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>Revisa todo el historial o filtra por módulo y pantalla. Los filtros quedan en la dirección de la página.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4">
              <Select
                value={filters.module ?? ALL}
                onValueChange={(value) => setFilters({ ...filters, module: value === ALL ? undefined : value, entity: undefined, page: undefined })}
              >
                <SelectTrigger aria-label="Módulo" className="w-full"><SelectValue placeholder="Módulo: todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Módulo: todos</SelectItem>
                  {MODULES.map((module) => <SelectItem key={module.key} value={module.key}>{module.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.entity ?? ALL} onValueChange={(value) => set("entity", value === ALL ? undefined : value)}>
                <SelectTrigger aria-label="Pantalla" className="w-full"><SelectValue placeholder="Pantalla: todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Pantalla: todas</SelectItem>
                  {screens.map((entity) => (
                    <SelectItem key={entity} value={entity}>{ENTITY_LABELS[entity] ?? entity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.source ?? ALL} onValueChange={(value) => set("source", value === ALL ? undefined : value)}>
                <SelectTrigger aria-label="Origen" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Origen: todos</SelectItem>
                  {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Desde</span>
                <Input type="date" value={filters.from ?? ""} onChange={(event) => set("from", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Hasta</span>
                <Input type="date" value={filters.to ?? ""} onChange={(event) => set("to", event.target.value)} />
              </label>
            </div>
            <SheetFooter>
              <Button variant="outline" disabled={active === 0} onClick={() => setFilters({})}>
                Limpiar filtros
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        {active > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar
          </Button>
        )}
        {data && (
          <span className="text-xs text-muted-foreground">
            {data.total} cambio{data.total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {isLoading ? null : isError ? (
        <p className="text-sm text-destructive">No se pudo leer el historial.</p>
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="Sin cambios" description={active ? "No hay cambios con estos filtros" : "Todavía no se registró ningún cambio"} />
      ) : (
        <>
          <HistoryTimeline entries={data.items} labels={data.labels} showRecord />
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setFilters({ ...filters, page: page > 2 ? String(page - 1) : undefined })}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Más nuevos
            </Button>
            <span className="text-xs text-muted-foreground">
              Página {page} de {pages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setFilters({ ...filters, page: String(page + 1) })}>
              Más antiguos <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
