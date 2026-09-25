import { useEffect, useState } from "react";

import { useAddDebtPayment } from "@/shared/api/hooks/debts";
import type { Debt } from "@/shared/api/types";
import { PaymentMethodSelect } from "@/shared/components/CatalogSelect";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { formatCurrency } from "@/shared/lib/currency";
import { toIsoDate } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { PAYMENT_KIND_LABELS, type PaymentKind } from "../debt-filters";

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
  const [methodId, setMethodId] = useState<string | null>(null);

  useEffect(() => {
    if (debt) {
      setAmount(String(debt.balance));
      setPaidAt(toIsoDate(new Date()));
      setKind("payment");
      setMethodId(null);
    }
  }, [debt]);

  const value = Number(amount);
  const valid = debt && value > 0 && value <= debt.balance;
  // Less than the balance is an abono unless the user says otherwise
  const changeAmount = (next: string) => {
    setAmount(next);
    if (debt && kind === "payment" && Number(next) < debt.balance) setKind("partial");
    if (debt && kind === "partial" && Number(next) >= debt.balance) setKind("payment");
  };

  const handleSave = () => {
    if (!debt || !valid) return;
    addPayment.mutate(
      { id: debt.id, body: { amount: value, paidAt, kind, paymentMethodId: methodId } },
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
            <label className="text-sm font-medium">Tipo</label>
            <Select value={kind} onValueChange={(next) => setKind(next as PaymentKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_KIND_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            <label className="text-sm font-medium">Medio</label>
            <PaymentMethodSelect allowEmpty value={methodId} onChange={setMethodId} placeholder="Opcional" />
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
