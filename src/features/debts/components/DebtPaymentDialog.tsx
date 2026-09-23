import { useEffect, useState } from "react";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { useAddDebtPayment } from "@/shared/api/hooks/debts";
import type { Debt } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { toIsoDate } from "@/shared/lib/dates";

interface DebtPaymentDialogProps {
  debt?: Debt;
  onOpenChange: (open: boolean) => void;
}

// An abono towards one installment: kogane-api recomputes the balance and the status (D60)
export function DebtPaymentDialog({ debt, onOpenChange }: DebtPaymentDialogProps) {
  const addPayment = useAddDebtPayment();
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(toIsoDate(new Date()));

  useEffect(() => {
    if (debt) {
      setAmount(String(debt.balance));
      setPaidAt(toIsoDate(new Date()));
    }
  }, [debt]);

  const value = Number(amount);
  const valid = debt && value > 0 && value <= debt.balance;

  const handleSave = () => {
    if (!debt || !valid) return;
    addPayment.mutate({ id: debt.id, body: { amount: value, paidAt } }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <ResponsiveDialog
      open={!!debt}
      onOpenChange={onOpenChange}
      title="Registrar abono"
      description={debt ? `${debt.description}${debt.installment ? ` ${debt.installment}` : ""} · ${debt.person.name}` : ""}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!valid || addPayment.isPending}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Monto</label>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          {debt && <p className="text-xs text-muted-foreground">Saldo: {formatCurrency(debt.balance)}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Fecha</label>
          <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
        </div>
      </div>
    </ResponsiveDialog>
  );
}
