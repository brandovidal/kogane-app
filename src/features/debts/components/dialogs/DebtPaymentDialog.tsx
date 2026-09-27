import { useEffect, useState } from "react";

import { useAddDebtPayment } from "@/shared/api/hooks/debts";
import type { Debt } from "@/shared/api/types";
import { usePaymentMethods } from "@/shared/api/hooks/catalogs";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { formatCurrency } from "@/shared/lib/currency";
import { toIsoDate } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/ui/select";

type PaymentKind = "payment" | "prepaid" | "cashback";
type PaymentScope = "total" | "partial";

interface DebtPaymentDialogProps {
  debt?: Debt;
  onOpenChange: (open: boolean) => void;
}

// A payment towards one installment, with its kind (D114): kogane-api recomputes the balance and the status (D60)
export function DebtPaymentDialog({ debt, onOpenChange }: DebtPaymentDialogProps) {
  const addPayment = useAddDebtPayment();
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(toIsoDate(new Date()));
  const [kind, setKind] = useState<PaymentKind>("payment");
  const [scope, setScope] = useState<PaymentScope>("total");
  const [methodId, setMethodId] = useState<string | null>(null);
  const methods = usePaymentMethods().data?.filter((method) => method.isActive) ?? [];
  const method = methods.find((item) => item.id === methodId);
  const canAmortize = method?.type === "credit_card" && method.supportsAmortization;
  const canCashback = method?.type === "credit_card" && method.supportsCashback;

  useEffect(() => {
    if (debt) {
      setAmount(String(debt.balance));
      setPaidAt(toIsoDate(new Date()));
      setKind("payment");
      setScope("total");
      setMethodId(null);
    }
  }, [debt]);

  const value = Number(amount);
  const valid = debt && value > 0 && value <= debt.balance && !!methodId &&
    (kind !== "payment" || (scope === "total" ? value >= debt.balance - 0.005 : value < debt.balance - 0.005));
  const changeAmount = (next: string) => {
    setAmount(next);
    if (debt && kind === "payment") setScope(Number(next) < debt.balance ? "partial" : "total");
  };

  const changeMethod = (next: string) => {
    setMethodId(next);
    setKind("payment");
  };

  const handleSave = () => {
    if (!debt || !valid) return;
    addPayment.mutate(
      { id: debt.id, body: { amount: value, paidAt, kind: kind === "payment" ? scope === "partial" ? "partial" : "payment" : kind, paymentMethodId: methodId } },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <ResponsiveDialog
      open={!!debt}
      onOpenChange={onOpenChange}
      title="Registrar pago"
      description={debt ? `${debt.description}${debt.installment ? ` ${debt.installment}` : ""} · ${debt.person.name}` : ""}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!valid || addPayment.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
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
            <Select value={kind} onValueChange={(next) => setKind(next as PaymentKind)}>
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
            ? "Amortización: pago adelantado que reduce el saldo de esta deuda."
            : kind === "cashback"
              ? "Cashback: devolución o reintegro que reduce el saldo adeudado."
              : scope === "partial"
                ? "Pago parcial (abono): reduce el saldo y deja la diferencia pendiente."
                : "Pago total: cubre el saldo completo de esta cuota."}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Monto</label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => changeAmount(e.target.value)} autoFocus />
            {debt && <p className="text-xs text-muted-foreground">Saldo: {formatCurrency(debt.balance)}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha</label>
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Medio de pago <span className="text-destructive">*</span></label>
            <Select value={methodId ?? ""} onValueChange={changeMethod}>
              <SelectTrigger aria-label="Medio de pago obligatorio"><SelectValue placeholder="Selecciona un medio" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tarjetas</SelectLabel>
                  {methods.filter((method) => method.type === "credit_card").map((method) => <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>)}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Cuentas y otros medios</SelectLabel>
                  {methods.filter((method) => method.type !== "credit_card").map((method) => <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            {!methodId && <p className="text-xs text-muted-foreground">Selecciona cómo se realizó el pago. Las opciones especiales se configuran por tarjeta en Cuentas y tarjetas.</p>}
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
