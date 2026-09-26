import { useEffect, useMemo, useState } from "react";
import { useCardCheck, useCreateDebt } from "@/shared/api/hooks/debts";
import { PersonSelect } from "@/shared/components/CatalogSelect";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";

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
  const createDebt = useCreateDebt();
  const [includedPayments, setIncludedPayments] = useState<Set<string>>(new Set());
  const [collectorId, setCollectorId] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!check?.statementId) return;
    setIncludedPayments(new Set(check.periodPayments.map((payment) => payment.personId)));
    setDescription(`Saldo restante ${cardName} · ${getMonthName(month)} ${year}`);
  }, [check?.statementId, check?.periodPayments, cardName, month, year]);

  const paid = useMemo(
    () => (check?.periodPayments ?? []).reduce((sum, payment) => sum + (includedPayments.has(payment.personId) ? payment.amount : 0), 0),
    [check?.periodPayments, includedPayments],
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando el estado de cuenta {cardName}…</p>;
  if (!check?.statementId) {
    return <p className="text-sm text-muted-foreground">No hay estado de cuenta {cardName} para {getMonthName(month)} {year}. Cárgalo desde <a className="underline underline-offset-4" href="/reconocimiento">Reconocimiento</a>.</p>;
  }

  const total = check.statementTotal;
  const remaining = total == null ? null : Math.max(0, total - paid);
  const progress = total == null || total <= 0 ? 0 : Math.min(100, (paid / total) * 100);
  const complete = remaining != null && remaining <= 0;

  return (
    <section className={`rounded-lg border bg-card ${compact ? "p-3" : "p-4"}`}>
      <div className={compact ? "space-y-3" : "space-y-4"}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">Pago total · {cardName} · {getMonthName(month)} {year}</h3>
            <p className="text-xs text-muted-foreground">Seguimiento de pagos registrados para los cobros de esta tarjeta.</p>
          </div>
          <a href="/reconocimiento" className="text-xs text-muted-foreground underline underline-offset-4">Ver estado de cuenta</a>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-3">
          <div className="rounded-md bg-muted/40 p-2"><p className="text-xs text-muted-foreground">Total del estado</p><p className="font-semibold tabular-nums">{total == null ? "—" : formatCurrency(total)}</p></div>
          <div className="rounded-md bg-sky-500/10 p-2"><p className="text-xs text-muted-foreground">Pagos que se descuentan</p><p className="font-semibold tabular-nums text-sky-300">{formatCurrency(paid)}</p></div>
          <div className={`col-span-2 rounded-md p-2 lg:col-span-1 ${complete ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
            <p className="text-xs text-muted-foreground">{total == null ? "Total pendiente" : complete ? "Total cubierto" : "Falta para el total"}</p>
            <p className={`font-semibold tabular-nums ${complete ? "text-emerald-300" : "text-amber-300"}`}>{remaining == null ? "—" : formatCurrency(remaining)}</p>
          </div>
        </div>
        {total != null && <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${complete ? "bg-emerald-500" : "bg-sky-500"}`} style={{ width: `${progress}%` }} /></div>}
        <section className="space-y-3 border-t pt-3">
          <div>
            <h4 className="text-sm font-semibold">Calcular y cobrar el saldo restante</h4>
            <p className="text-xs text-muted-foreground">Marca qué pagos registrados se descuentan del total. Luego puedes crear un solo cobro por el saldo pendiente a nombre de una persona.</p>
          </div>
          {check.periodPayments.length ? (
            <div className="space-y-2 rounded-md bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">Pagos registrados en el período</p>
              {check.periodPayments.map((payment) => (
                <label key={payment.personId} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2"><Checkbox checked={includedPayments.has(payment.personId)} onCheckedChange={(checked) => setIncludedPayments((current) => {
                    const next = new Set(current);
                    if (checked === true) next.add(payment.personId); else next.delete(payment.personId);
                    return next;
                  })} /><span className="truncate">{payment.name}</span></span>
                  <strong className="shrink-0 tabular-nums">{formatCurrency(payment.amount)}</strong>
                </label>
              ))}
            </div>
          ) : <p className="rounded-md bg-muted/20 p-3 text-sm text-muted-foreground">No hay pagos registrados de otras personas para este período.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs text-muted-foreground"><span>Persona a quien cobrar</span><PersonSelect value={collectorId} onChange={setCollectorId} placeholder="Selecciona una persona" /></label>
            <label className="space-y-1 text-xs text-muted-foreground"><span>Concepto del cobro</span><Input value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2">
            <p className="text-sm">{total == null ? "Total del estado no disponible" : <>Cobro a crear: <strong className="tabular-nums">{formatCurrency(remaining ?? 0)}</strong></>}</p>
            <Button size="sm" disabled={total == null || !remaining || !collectorId || !description.trim() || createDebt.isPending} onClick={() => {
              if (total == null || remaining == null || remaining <= 0 || !collectorId) return;
              createDebt.mutate({
                direction: "owed_to_me",
                description: description.trim(),
                amount: remaining,
                personId: collectorId,
                paymentMonth: month,
                paymentYear: year,
                paymentMethodId,
                installments: 1,
              }, { onSuccess: () => setCollectorId(null) });
            }}>
              {createDebt.isPending ? "Creando cobro…" : "Crear cobro"}
            </Button>
          </div>
          {paid > (total ?? 0) && <p className="text-xs text-amber-300">Los pagos seleccionados superan el total del estado en {formatCurrency(paid - (total ?? 0))}; el cobro queda en S/ 0.00.</p>}
        </section>
        <p className="text-xs text-muted-foreground">Solo se consideran pagos registrados a los cobros de esta tarjeta; no se incluyen pagos bancarios del titular que no estén registrados en Kogane.</p>
      </div>
    </section>
  );
}
