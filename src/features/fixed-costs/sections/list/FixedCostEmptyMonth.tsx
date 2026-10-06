import { useEffect, useState } from "react";
import { CalendarPlus, ChevronLeft, Copy, Plus } from "lucide-react";
import type { FixedCost } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import type { ViewMode } from "@/shared/types/data-view";

/**
 * Empty month: explains that nothing was registered and offers the two usual next
 * steps, going back to the previous month (to duplicate or move its costs from the
 * row menu) or creating one from scratch.
 */
export function FixedCostEmptyMonth({
  month,
  year,
  onCreate,
  onGoTo,
  view,
  previousCosts,
  previousLoading,
  copying,
  onCopy,
}: {
  month: number;
  year: number;
  onCreate: () => void;
  onGoTo: (month: number, year: number) => void;
  view: ViewMode;
  previousCosts: FixedCost[];
  previousLoading: boolean;
  copying: boolean;
  onCopy: (costs: FixedCost[]) => void;
}) {
  const previousIndex = year * 12 + month - 2;
  const previousMonth = (previousIndex % 12) + 1;
  const previousYear = Math.floor(previousIndex / 12);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    setSelectedIds(new Set(previousCosts.map((cost) => cost.id)));
  }, [previousCosts]);
  const selectedCosts = previousCosts.filter((cost) => selectedIds.has(cost.id));
  const toggleSelected = (id: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <section data-view={view} className="flex min-h-72 flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-brand">
        <CalendarPlus className="size-6" />
      </span>
      <p className="eyebrow">Sin registros</p>
      <h2 className="text-xl font-semibold tracking-tight">
        Aún no hay costos fijos en {getMonthName(month).toLowerCase()} {year}
      </h2>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        {previousCosts.length
          ? `Elige costos de ${getMonthName(previousMonth).toLowerCase()} para copiarlos aquí, o crea uno nuevo.`
          : `Puedes revisar ${getMonthName(previousMonth).toLowerCase()} o crear un costo fijo nuevo.`}
      </p>
      {previousLoading ? (
        <p role="status" className="text-sm text-muted-foreground">Buscando costos del mes anterior…</p>
      ) : previousCosts.length > 0 ? (
        <div className="w-full max-w-2xl space-y-2 text-left">
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span>Desde {getMonthName(previousMonth).toLowerCase()} {previousYear}</span>
            <span>{selectedCosts.length} de {previousCosts.length} seleccionados</span>
          </div>
          {view === "table" ? (
            <div className="overflow-hidden rounded-xl border bg-background/50">
              {previousCosts.map((cost) => (
                <label key={cost.id} className="flex min-h-11 cursor-pointer items-center gap-3 border-b px-3 last:border-b-0 hover:bg-muted/35">
                  <Checkbox checked={selectedIds.has(cost.id)} onCheckedChange={() => toggleSelected(cost.id)} aria-label={`Seleccionar ${cost.description}`} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{cost.description}</span>
                  {cost.installment && <span className="text-xs text-muted-foreground">cuota {cost.installment}</span>}
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{formatCurrency(cost.amountInPen ?? cost.amount)}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {previousCosts.map((cost) => (
                <label key={cost.id} className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background/50 p-3 text-left transition-colors hover:border-brand/40">
                  <Checkbox checked={selectedIds.has(cost.id)} onCheckedChange={() => toggleSelected(cost.id)} aria-label={`Seleccionar ${cost.description}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{cost.description}</span>
                    {cost.installment && <span className="block text-xs text-muted-foreground">Cuota {cost.installment}</span>}
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums">{formatCurrency(cost.amountInPen ?? cost.amount)}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {previousCosts.length > 0 && (
          <Button type="button" variant="outline" onClick={() => onGoTo(previousMonth, previousYear)}>
            <ChevronLeft className="size-4" /> Ver {getMonthName(previousMonth).toLowerCase()}
          </Button>
        )}
        <Button type="button" onClick={onCreate}>
          <Plus className="size-4" />
          Crear desde cero
        </Button>
        {selectedCosts.length > 0 && (
          <Button type="button" disabled={copying} onClick={() => onCopy(selectedCosts)}>
            <Copy className="size-4" />
            {copying ? "Copiando…" : `Copiar ${selectedCosts.length} de ${getMonthName(previousMonth).toLowerCase()}`}
          </Button>
        )}
      </div>
    </section>
  );
}
