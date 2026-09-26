import { useState } from "react";

import { useSavePaymentMethod } from "@/shared/api/hooks/catalogs";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { cardBody, cardErrors, emptyCardForm, type CardForm } from "../card-form";

// Nueva tarjeta (D97): credit needs its code and both days, debit its bank; nothing is sent until it is complete
export function NewCardDialog({ onClose }: { onClose: () => void }) {
  const save = useSavePaymentMethod();
  const [form, setForm] = useState<CardForm>(emptyCardForm());
  const [tried, setTried] = useState(false);
  const errors = cardErrors(form);
  const set = (change: Partial<CardForm>) => setForm({ ...form, ...change });

  const submit = () => {
    setTried(true);
    if (Object.keys(errors).length) return;
    save.mutate(cardBody(form) as never, { onSuccess: onClose });
  };
  const field = (key: keyof CardForm, label: string, input: React.ReactNode) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {input}
      {tried && errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Nueva tarjeta"
      description="Crédito: su código y los días de cierre y pago. Débito: su banco."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={save.isPending}>
            Crear
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          {field("name", "Nombre *", <Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ripley, Scotia…" autoFocus />)}
          {field(
            "type",
            "Tipo",
            <Select value={form.type} onValueChange={(type) => set({ type: type as CardForm["type"] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Tarjeta de crédito</SelectItem>
                <SelectItem value="debit_card">Tarjeta de débito</SelectItem>
              </SelectContent>
            </Select>,
          )}
        </div>
        {form.type === "credit_card" ? (
          <div className="grid grid-cols-3 gap-3">
            {field("code", "Código *", <Input value={form.code} maxLength={10} onChange={(e) => set({ code: e.target.value })} placeholder="RIP" />)}
            {field("billingCloseDay", "Día de cierre *", <Input inputMode="numeric" value={form.billingCloseDay} onChange={(e) => set({ billingCloseDay: e.target.value.replace(/\D/g, "") })} placeholder="25" />)}
            {field("paymentDueDay", "Día de pago *", <Input inputMode="numeric" value={form.paymentDueDay} onChange={(e) => set({ paymentDueDay: e.target.value.replace(/\D/g, "") })} placeholder="12" />)}
          </div>
        ) : (
          field("bank", "Banco *", <Input value={form.bank} onChange={(e) => set({ bank: e.target.value })} placeholder="Scotiabank" />)
        )}
      </div>
    </ResponsiveDialog>
  );
}
