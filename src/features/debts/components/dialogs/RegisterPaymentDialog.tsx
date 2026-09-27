import { useEffect, useMemo, useState } from "react";

import { useBulkDebts } from "@/shared/api/hooks/debts";
import { usePaymentMethods } from "@/shared/api/hooks/catalogs";
import type { Debt } from "@/shared/api/types";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName, toIsoDate } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/ui/select";

type PaymentKind = "payment" | "prepaid" | "cashback";
type PaymentScope = "total" | "partial";

const ACTION_OF_KIND = { payment: "pay", prepaid: "prepaid", cashback: "cashback" } as const;

interface RegisterPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debts: Debt[]; // the open debts of the page (one direction)
  period: { month: number; year: number };
}

// "Registrar pago" (D114): like Nuevo gasto, for what a person paid. Their installments up to the month on screen come
// checked; less than their balance is an abono spread oldest first
export function RegisterPaymentDialog({ open, onOpenChange, debts, period }: RegisterPaymentDialogProps) {
  const bulk = useBulkDebts();
  const methods = usePaymentMethods().data?.filter((method) => method.isActive) ?? [];
  const people = useMemo(
    () => [...new Map(debts.filter((debt) => debt.balance > 0).map((debt) => [debt.personId, debt.person.name])).entries()],
    [debts],
  );
  const [personId, setPersonId] = useState<string>("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [kind, setKind] = useState<PaymentKind>("payment");
  const [scope, setScope] = useState<PaymentScope>("total");
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(toIsoDate(new Date()));
  const [methodId, setMethodId] = useState<string | null>(null);

  const theirs = debts.filter((debt) => debt.personId === personId && debt.balance > 0);
  const selected = theirs.filter((debt) => checked.has(debt.id));
  const balance = selected.reduce((sum, debt) => sum + debt.balance, 0);
  const selectedMethod = methods.find((method) => method.id === methodId);
  const canAmortize = selectedMethod?.type === "credit_card" && selectedMethod.supportsAmortization;
  const canCashback = selectedMethod?.type === "credit_card" && selectedMethod.supportsCashback;
  const upToPeriod = (debt: Debt) => debt.paymentYear * 12 + debt.paymentMonth <= period.year * 12 + period.month;

  useEffect(() => {
    if (!open) return;
    setPersonId(people[0]?.[0] ?? "");
    setKind("payment");
    setScope("total");
    setPaidAt(toIsoDate(new Date()));
    setMethodId(null);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- only when it opens

  useEffect(() => {
    const due = debts.filter((debt) => debt.personId === personId && debt.balance > 0 && upToPeriod(debt));
    setChecked(new Set(due.map((debt) => debt.id)));
    setAmount(due.reduce((sum, debt) => sum + debt.balance, 0).toFixed(2));
  }, [personId]); // eslint-disable-line react-hooks/exhaustive-deps -- the person decides what comes checked

  const toggle = (id: string, on: boolean) => {
    const next = new Set(checked);
    if (on) next.add(id);
    else next.delete(id);
    setChecked(next);
    const total = theirs.filter((debt) => next.has(debt.id)).reduce((sum, debt) => sum + debt.balance, 0);
    setAmount(total.toFixed(2));
    setScope("total");
  };

  const value = Number(amount);
  const valid = selected.length > 0 && value > 0 && value <= balance + 0.005 && !!methodId &&
    (kind === "payment"
      ? scope === "total" ? value >= balance - 0.005 : value < balance - 0.005
      : Math.abs(value - balance) <= 0.005);

  const changeAmount = (next: string) => {
    setAmount(next);
    if (kind === "payment") setScope(Number(next) < balance ? "partial" : "total");
  };
  const changeKind = (next: PaymentKind) => {
    setKind(next);
    if (next !== "payment") {
      setScope("total");
      setAmount(balance.toFixed(2));
    }
  };
  const changeMethod = (next: string) => {
    setMethodId(next);
    setKind("payment");
    setScope("total");
  };

  const save = () => {
    const ids = selected.map((debt) => debt.id);
    const payment = { ids, paidAt, paymentMethodId: methodId };
    bulk.mutate(
      kind === "payment" && scope === "partial"
        ? { ...payment, action: "partial", amount: value }
        : { ...payment, action: ACTION_OF_KIND[kind as keyof typeof ACTION_OF_KIND] },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar pago"
      description="Lo que una persona pagó: sus cuotas hasta el mes en pantalla vienen marcadas."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!valid || bulk.isPending}>
            {kind === "payment" ? scope === "partial" ? "Registrar abono" : "Registrar pago" : kind === "prepaid" ? "Registrar amortización" : "Registrar cashback"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Persona</label>
            <Select value={personId} onValueChange={setPersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Elige" />
              </SelectTrigger>
              <SelectContent>
                {people.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Aplicación del pago</label>
            <Select value={scope} disabled={kind !== "payment"} onValueChange={(next) => setScope(next as PaymentScope)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Total o parcial</SelectLabel>
                  <SelectItem value="total">Pago total</SelectItem>
                  <SelectItem value="partial">Pago parcial</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de movimiento</label>
            <Select value={kind} onValueChange={(next) => changeKind(next as PaymentKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Movimiento</SelectLabel>
                  <SelectItem value="payment">Pago habitual</SelectItem>
                  {canAmortize && <SelectItem value="prepaid">Amortización</SelectItem>}
                  {canCashback && <SelectItem value="cashback">Cashback</SelectItem>}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          {kind === "prepaid"
            ? "Amortización: paga por adelantado los saldos seleccionados de esta tarjeta. Se registra el total pendiente."
            : kind === "cashback"
              ? "Cashback: registra una devolución del emisor que cancela los saldos seleccionados."
              : scope === "partial"
                ? "Pago parcial (abono): reparte el monto entre las cuotas más antiguas y deja el resto pendiente."
                : "Pago total: cubre el saldo completo de todas las cuotas seleccionadas."}
        </p>

        <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
          {theirs.length === 0 && <p className="p-2 text-sm text-muted-foreground">No tiene cuotas con saldo.</p>}
          {theirs.map((debt) => (
            <label key={debt.id} className="flex items-center justify-between gap-2 rounded px-1 py-1 text-sm hover:bg-muted/50">
              <span className="flex min-w-0 items-center gap-2">
                <Checkbox checked={checked.has(debt.id)} onCheckedChange={(on) => toggle(debt.id, on === true)} />
                <span className="truncate">
                  {debt.description}
                  {debt.installment ? ` ${debt.installment}` : ""} ·{" "}
                  <span className="text-muted-foreground">
                    {getMonthName(debt.paymentMonth).slice(0, 3)} {debt.paymentYear}
                  </span>
                </span>
              </span>
              <span className="shrink-0 tabular-nums">{formatCurrency(debt.balance)}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Monto</label>
            <Input type="number" step="0.01" value={amount} disabled={kind !== "payment"} onChange={(e) => changeAmount(e.target.value)} />
            <p className="text-xs text-muted-foreground">Saldo {formatCurrency(balance)}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha</label>
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Medio de pago <span className="text-destructive">*</span></label>
            <Select value={methodId ?? ""} onValueChange={changeMethod}>
              <SelectTrigger aria-label="Medio de pago obligatorio"><SelectValue placeholder="Selecciona un medio" /></SelectTrigger>
              <SelectContent>
                <SelectGroup><SelectLabel>Tarjetas</SelectLabel>{methods.filter((method) => method.type === "credit_card").map((method) => <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>)}</SelectGroup>
                <SelectSeparator />
                <SelectGroup><SelectLabel>Cuentas y otros medios</SelectLabel>{methods.filter((method) => method.type !== "credit_card").map((method) => <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>)}</SelectGroup>
              </SelectContent>
            </Select>
            {!methodId && <p className="text-xs text-muted-foreground">Selecciona cómo se realizó el pago. Los movimientos especiales se configuran por tarjeta en Cuentas y tarjetas.</p>}
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
