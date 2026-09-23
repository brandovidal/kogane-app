import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { PersonSelect } from "@/shared/components/CatalogSelect";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useSaveExpense } from "@/shared/api/hooks/expenses";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import {
  CREDIT_CARD_STATUSES,
  CURRENCIES,
  EXPENSE_TYPE_LABELS,
  EXPENSE_TYPES,
  PAYMENT_STATUS_LABELS,
} from "@/shared/labels";
import { usePeriod } from "@/shared/stores/period.store";

const optionalText = z.string().trim().transform((value) => value || null);

const cardExpenseFormSchema = z.object({
  description: z.string().trim().min(1, "Descripción requerida"),
  amount: z.number({ error: "Monto requerido" }).positive("Monto debe ser positivo"),
  currency: z.enum(CURRENCIES),
  exchangeRate: z.number().positive().nullable(),
  expenseType: z.string(),
  paymentStatus: z.string(),
  personId: z.string().min(1, "Persona requerida"),
  installment: optionalText.refine((value) => !value || /^\d{1,3}\/\d{1,3}$/.test(value), "Usa n/m, ej: 1/3"),
  processDate: z.string(),
  notes: optionalText,
});
type CardExpenseForm = z.input<typeof cardExpenseFormSchema>;
type CardExpenseValues = z.output<typeof cardExpenseFormSchema>;

const emptyForm: CardExpenseForm = {
  description: "",
  amount: 0,
  currency: "PEN",
  exchangeRate: null,
  expenseType: "essential",
  paymentStatus: "pending",
  personId: "",
  installment: "",
  processDate: "",
  notes: "",
};

interface CreditCardExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditCardId: string; // the payment method of type credit_card
}

// New expense of a card in the month on screen (its billing month)
export function CreditCardExpenseDialog({ open, onOpenChange, creditCardId }: CreditCardExpenseDialogProps) {
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.creditCard);
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<
    CardExpenseForm,
    unknown,
    CardExpenseValues
  >({ resolver: zodResolver(cardExpenseFormSchema), defaultValues: emptyForm });
  const currency = watch("currency");

  useEffect(() => {
    if (open) reset(emptyForm);
  }, [open, reset]);

  const onSubmit = handleSubmit((data) => {
    const body = {
      ...data,
      exchangeRate: data.currency === "PEN" ? null : data.exchangeRate,
      processDate: data.processDate || null,
      paymentMethodId: creditCardId,
      paymentMonth: month,
      paymentYear: year,
    };
    saveExpense.mutate({ body }, { onSuccess: () => onOpenChange(false) });
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo gasto de tarjeta"
      description="Se registra en el mes de facturación que estás viendo"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={saveExpense.isPending}>Crear</Button>
        </>
      }
    >
      <form className="space-y-4 py-2" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción *</label>
          <Input {...register("description")} placeholder="Ej: Supermercado, Laptop..." />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Monto *</label>
            <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Moneda</label>
            <Select value={currency} onValueChange={(v) => setValue("currency", v as CardExpenseForm["currency"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {currency !== "PEN" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de cambio</label>
            <Input
              type="number"
              step="0.001"
              {...register("exchangeRate", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })}
              placeholder="Ej: 3.75"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de gasto</label>
            <Select value={watch("expenseType")} onValueChange={(v) => setValue("expenseType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPENSE_TYPES.map((t) => <SelectItem key={t} value={t}>{EXPENSE_TYPE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Estado</label>
            <Select value={watch("paymentStatus")} onValueChange={(v) => setValue("paymentStatus", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CREDIT_CARD_STATUSES.map((s) => <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Persona *</label>
            <PersonSelect value={watch("personId")} onChange={(id) => setValue("personId", id ?? "", { shouldValidate: true })} />
            {errors.personId && <p className="text-xs text-destructive">{errors.personId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cuotas</label>
            <Input {...register("installment")} placeholder="Ej: 1/3" />
            {errors.installment && <p className="text-xs text-destructive">{errors.installment.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Fecha de proceso</label>
          <Input type="date" {...register("processDate")} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Observación</label>
          <Input {...register("notes")} placeholder="Nota adicional..." />
        </div>
      </form>
    </ResponsiveDialog>
  );
}
