import { useEffect, useMemo, useState } from "react";
import { useCardCheck } from "@/shared/api/hooks/debts";
import { PersonSelect } from "@/shared/components/CatalogSelect";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Checkbox } from "@/ui/checkbox";

export function StatementTotalCard({
  paymentMethodId,
  cardName,
  month,
  year,
  compact = false,
}: {
  paymentMethodId: string;
  cardName: string;
  month: number;
  year: number;
  compact?: boolean;
}) {
  const { data: check, isLoading } = useCardCheck({ paymentMethodId, month, year });
  const [includedPeople, setIncludedPeople] = useState<Set<string>>(new Set());
  const [visualAssigneeId, setVisualAssigneeId] = useState<string | null>(null);

  useEffect(() => {
    if (!check?.statementId) return;
    setIncludedPeople(new Set(check.expensesByPerson.map((person) => person.personId)));
    setVisualAssigneeId(check.statementPersonId);
  }, [check?.statementId, check?.expensesByPerson, check?.statementPersonId]);

  const selectedCharges = useMemo(
    () => (check?.expensesByPerson ?? []).reduce((sum, person) => sum + (includedPeople.has(person.personId) ? person.amount : 0), 0),
    [check?.expensesByPerson, includedPeople],
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando el estado de cuenta {cardName}…</p>;
  if (!check?.statementId) {
    return <p className="text-sm text-muted-foreground">No hay estado de cuenta {cardName} para {getMonthName(month)} {year}. Cárgalo desde <a className="underline underline-offset-4" href="/reconocimiento">Reconocimiento</a>.</p>;
  }

  const total = check.statementTotal;
  const remaining = total == null ? null : Math.max(0, total - selectedCharges);
  const progress = total == null || total <= 0 ? 0 : Math.min(100, (selectedCharges / total) * 100);
  const complete = remaining != null && remaining <= 0;

  return (
    <section className={`rounded-lg border bg-card ${compact ? "p-3" : "p-4"}`}>
      <div className={compact ? "space-y-3" : "space-y-4"}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">Pago total · {cardName} · {getMonthName(month)} {year}</h3>
            <p className="text-xs text-muted-foreground">Pago total menos el pago actual considerado equivale al pago restante.</p>
          </div>
          <a href="/reconocimiento" className="text-xs text-muted-foreground underline underline-offset-4">Ver estado de cuenta</a>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-3">
          <div className="rounded-md bg-muted/40 p-2"><p className="text-xs text-muted-foreground">Pago total</p><p className="font-semibold tabular-nums">{total == null ? "—" : formatCurrency(total)}</p></div>
          <div className="rounded-md bg-sky-500/10 p-2"><p className="text-xs text-muted-foreground">Pago actual considerado</p><p className="font-semibold tabular-nums text-sky-300">{formatCurrency(selectedCharges)}</p></div>
          <div className={`col-span-2 rounded-md p-2 lg:col-span-1 ${complete ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
            <p className="text-xs text-muted-foreground">Pago restante</p>
            <p className={`font-semibold tabular-nums ${complete ? "text-emerald-300" : "text-amber-300"}`}>{remaining == null ? "—" : formatCurrency(remaining)}</p>
          </div>
        </div>
        {total != null && <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${complete ? "bg-emerald-500" : "bg-sky-500"}`} style={{ width: `${progress}%` }} /></div>}
        <section className="space-y-3 border-t pt-3">
          <div>
            <h4 className="text-sm font-semibold">Cálculo del saldo</h4>
            <p className="text-xs text-muted-foreground">Desmarca a las personas que no quieras descontar del total. Este cálculo es visual y no crea ni modifica cobros o deudas.</p>
          </div>
          {check.expensesByPerson.length ? (
            <div className="space-y-2 rounded-md bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">Cargos por persona</p>
              {check.expensesByPerson.map((person) => (
                <label key={person.personId} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2"><Checkbox checked={includedPeople.has(person.personId)} onCheckedChange={(checked) => setIncludedPeople((current) => {
                    const next = new Set(current);
                    if (checked === true) next.add(person.personId); else next.delete(person.personId);
                    return next;
                  })} /><span className="truncate">{person.name}</span></span>
                  <strong className="shrink-0 tabular-nums">{formatCurrency(person.amount)}</strong>
                </label>
              ))}
              <div className="flex justify-between border-t pt-2 text-sm font-medium"><span>Pago actual considerado</span><span className="tabular-nums">{formatCurrency(selectedCharges)}</span></div>
            </div>
          ) : <p className="rounded-md bg-muted/20 p-3 text-sm text-muted-foreground">No hay cargos asignados a personas para este período.</p>}
          {total != null && selectedCharges > total && <p className="text-xs text-amber-300">Los cargos seleccionados superan el total del estado en {formatCurrency(selectedCharges - total)}; el saldo pendiente se muestra como S/ 0.00.</p>}
          {remaining != null && (
            <div className="grid gap-3 rounded-md border bg-muted/10 p-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-center">
              <div>
                <p className="text-sm font-medium">Asignación visual del remanente</p>
                <p className="text-xs text-muted-foreground">El saldo se atribuye solo para esta consulta; no se guarda como deuda ni cobro.</p>
              </div>
              <PersonSelect value={visualAssigneeId} onChange={setVisualAssigneeId} placeholder="Selecciona persona" />
              <strong className="text-right tabular-nums">{formatCurrency(remaining)}</strong>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
