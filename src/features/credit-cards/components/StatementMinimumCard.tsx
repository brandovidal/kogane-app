import { useEffect, useState } from "react";
import { ChevronRight, Save } from "lucide-react";

import { useCardCheck } from "@/shared/api/hooks/debts";
import { usePeople } from "@/shared/api/hooks/catalogs";
import { useUpdateStatementMinimum } from "@/shared/api/hooks/statements";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";

export function StatementMinimumCard({
  paymentMethodId,
  cardName,
  excludedByFilter = false,
  totalToCollect,
  month,
  year,
}: {
  paymentMethodId?: string;
  cardName: string;
  excludedByFilter?: boolean;
  totalToCollect?: number;
  month: number;
  year: number;
}) {
  const { data: check, isLoading } = useCardCheck(paymentMethodId ? { paymentMethodId, month, year } : null);
  const people = usePeople().data ?? [];
  const updateMinimum = useUpdateStatementMinimum();
  const [adjustMode, setAdjustMode] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!check?.statementId) return;
    setAdjustments(Object.fromEntries(
      check.expensesByPerson.map((person) => [
        person.personId,
        String(check.minimumAllocations?.[person.personId] ?? person.amount),
      ]),
    ));
  }, [check?.statementId]);

  const expensePeople = new Map((check?.expensesByPerson ?? []).map((person) => [person.personId, person]));
  const participantIds = new Set([
    ...expensePeople.keys(),
    ...(check?.people.map((person) => person.personId) ?? []),
    ...(check?.statementPersonId ? [check.statementPersonId] : []),
  ]);
  const participants = [...participantIds].map((personId) => {
    const chargePerson = expensePeople.get(personId);
    const person = people.find((item) => item.id === personId);
    const name = chargePerson?.name ?? person?.name ?? "Titular";
    return {
      personId,
      name,
      chargePerson: chargePerson ?? { personId, name, amount: 0, expenses: [] },
      titular: personId === check?.statementPersonId,
    };
  }).sort((a, b) => Number(b.titular) - Number(a.titular) || a.name.localeCompare(b.name, "es"));
  const contributionOf = (personId: string, baseAmount: number) => {
    const raw = adjustMode ? adjustments[personId] ?? String(check?.minimumAllocations?.[personId] ?? baseAmount) : String(baseAmount);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };
  const contributionsTotal = participants.reduce(
    (sum, person) => sum + contributionOf(person.personId, person.chargePerson.amount),
    0,
  );
  const minimum = check?.minimumDue ?? null;
  const remaining = minimum === null ? 0 : Math.max(0, minimum - (check?.othersPaid ?? 0));
  const covered = minimum !== null && contributionsTotal >= remaining - 0.005;
  const gap = Math.max(0, remaining - contributionsTotal);
  const excess = Math.max(0, contributionsTotal - remaining);

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
          <div>
            <h3 className="font-semibold">{cardName} · {getMonthName(month)} {year}</h3>
            <p className="text-xs text-muted-foreground">El mínimo se compara con cargos asignados a las personas; el total del estado es solo referencia.</p>
          </div>
          {check?.statementId && <a href="/reconocimiento" className="text-xs text-muted-foreground underline underline-offset-4">Ver estado de cuenta</a>}
        </div>
        {check?.statementId ? (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
              <div className="rounded-md bg-muted/40 p-2"><p className="text-xs text-muted-foreground">Total del estado</p><p className="font-semibold tabular-nums">{formatCurrency(check.statementTotal ?? 0)}</p></div>
              <div className="rounded-md bg-emerald-500/10 p-2"><p className="text-xs text-muted-foreground">Pago mínimo</p><p className="font-semibold tabular-nums text-emerald-300">{formatCurrency(minimum ?? 0)}</p></div>
              <div className="rounded-md bg-muted/40 p-2"><p className="text-xs text-muted-foreground">Abonado por personas</p><p className="font-semibold tabular-nums text-sky-300">{formatCurrency(check.othersPaid)}</p></div>
              <div className={`rounded-md p-2 ${covered ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                <p className="text-xs text-muted-foreground">{minimum === null ? "Mínimo sin registrar" : covered ? "Mínimo cubierto" : "Falta para el mínimo"}</p>
                <p className={`font-semibold tabular-nums ${covered ? "text-emerald-300" : "text-amber-300"}`}>
                  {minimum === null ? "—" : covered ? `Excedente ${formatCurrency(excess)}` : formatCurrency(gap)}
                </p>
              </div>
            </div>
            {minimum !== null && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted/20 px-3 py-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="font-medium">Aportes {cardName}</span>
                    {participants.map((person) => (
                      <span key={person.personId} className="text-muted-foreground">
                        {person.name} <strong className="text-foreground tabular-nums">{formatCurrency(contributionOf(person.personId, person.chargePerson.amount))}</strong>
                      </span>
                    ))}
                    <span className={`font-semibold tabular-nums ${covered ? "text-emerald-300" : "text-amber-300"}`}>
                      {formatCurrency(contributionsTotal)} / {formatCurrency(remaining)}
                    </span>
                  </div>
                  <label className="flex shrink-0 items-center gap-2 text-xs">
                    <span>Ajustar montos</span>
                    <Switch checked={adjustMode} onCheckedChange={setAdjustMode} />
                  </label>
                </div>
                <div className="overflow-x-auto rounded-md border">
                  <div className="grid min-w-[520px] grid-cols-[minmax(0,1fr)_7rem_9rem] border-b bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground">
                    <span>Titular / adicional</span><span className="text-right">Registros</span><span className="text-right">{adjustMode ? "Aporte al mínimo" : `Cobros ${cardName}`}</span>
                  </div>
                  {participants.map((person) => (
                    <details key={person.personId} className="group border-b last:border-0">
                      <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_7rem_9rem] items-center gap-2 px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
                        <span className="flex min-w-0 items-center gap-2"><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" /><span className="truncate">{person.name}{person.titular ? " · titular" : ""}</span></span>
                        <span className="text-right tabular-nums text-muted-foreground">{person.chargePerson.expenses.length}</span>
                        {adjustMode ? (
                          <Input type="number" min="0" step="0.01" aria-label={`Aporte de ${person.name} al mínimo ${cardName}`} className="h-8 text-right tabular-nums" value={adjustments[person.personId] ?? String(check.minimumAllocations?.[person.personId] ?? person.chargePerson.amount)} onClick={(event) => event.stopPropagation()} onChange={(event) => setAdjustments((current) => ({ ...current, [person.personId]: event.target.value }))} />
                        ) : <strong className="text-right tabular-nums">{formatCurrency(contributionOf(person.personId, person.chargePerson.amount))}</strong>}
                      </summary>
                      <div className="space-y-1 border-t bg-muted/10 px-10 py-2 text-xs">
                        {person.chargePerson.expenses.length ? person.chargePerson.expenses.map((expense) => (
                          <div key={expense.id} className="flex justify-between gap-3"><span className="min-w-0 truncate">{expense.description}</span><span className="shrink-0 tabular-nums">{formatCurrency(expense.amount)}</span></div>
                        )) : <p className="text-muted-foreground">Sin cargos {cardName} registrados para esta persona.</p>}
                      </div>
                    </details>
                  ))}
                  <div className="grid min-w-[520px] grid-cols-[minmax(0,1fr)_7rem_9rem] items-center gap-2 border-t-2 bg-muted/20 px-3 py-2 text-sm font-semibold">
                    <span>Total asignado al mínimo</span>
                    <span className="text-right text-xs font-normal text-muted-foreground">{participants.reduce((sum, person) => sum + person.chargePerson.expenses.length, 0)} registros</span>
                    <span className={`text-right tabular-nums ${covered ? "text-emerald-300" : "text-amber-300"}`}>{formatCurrency(contributionsTotal)}</span>
                  </div>
                </div>
                {adjustMode && (
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" disabled={updateMinimum.isPending} onClick={() => updateMinimum.mutate({ id: check.statementId!, minimumAllocations: Object.fromEntries(participants.map((person) => [person.personId, contributionOf(person.personId, Number(adjustments[person.personId] ?? check.minimumAllocations?.[person.personId] ?? person.chargePerson.amount))])) })}>
                      <Save className="mr-1 h-4 w-4" /> Guardar reparto
                    </Button>
                  </div>
                )}
              </div>
            )}
            {minimum === null && <p className="text-sm text-amber-300">No hay pago mínimo guardado.{totalToCollect != null && <> Total de cobros con los filtros aplicados: {formatCurrency(totalToCollect)}.</>}</p>}
            <form className="flex flex-wrap items-end gap-2 border-t pt-3" onSubmit={(event) => {
              event.preventDefault();
              const raw = String(new FormData(event.currentTarget).get("minimumDue") ?? "").trim();
              const value = raw === "" ? null : Number(raw);
              if (value !== null && (!Number.isFinite(value) || value < 0)) return;
              updateMinimum.mutate({ id: check.statementId!, minimumDue: value });
            }}>
              <label className="space-y-1 text-xs text-muted-foreground"><span>{minimum === null ? "Ingresar pago mínimo" : "Ajustar pago mínimo"}<Input name="minimumDue" type="number" min="0" step="0.01" defaultValue={minimum ?? ""} className="mt-1 w-44" /></span></label>
              <Button size="sm" type="submit" variant="outline" disabled={updateMinimum.isPending}><Save className="mr-1 h-4 w-4" /> Guardar mínimo</Button>
            </form>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isLoading ? `Cargando el estado de cuenta ${cardName}…` : excludedByFilter ? `El filtro actual no incluye ${cardName}.` : <>No hay estado de cuenta {cardName} para este período.{totalToCollect != null && <> Total de cobros con los filtros aplicados: <strong className="text-amber-300">{formatCurrency(totalToCollect)}</strong>.</>} <a className="underline underline-offset-4" href="/reconocimiento">Cargar estado de cuenta</a></>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
