import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { CategorySelect, PaymentMethodSelect, PersonSelect } from "@/shared/components/CatalogSelect";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useSaveExpense } from "@/shared/api/hooks/expenses";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import {
  CURRENCIES,
  EXPENSE_TYPE_LABELS,
  EXPENSE_TYPES,
  RECURRING_TARGET_LABELS,
  RECURRING_TARGETS,
} from "@/shared/labels";

const recurringFormSchema = z
  .object({
    description: z.string().trim().min(1, "Descripción requerida"),
    amount: z.number({ error: "Monto requerido" }).positive("Monto debe ser positivo"),
    currency: z.enum(CURRENCIES),
    targetType: z.string(),
    dayOfMonth: z.number({ error: "Día requerido" }).int().min(1).max(31),
    personId: z.string().min(1, "Persona requerida"),
    paymentMethodId: z.string().nullable(),
    categoryId: z.string().nullable(),
    expenseType: z.string(),
  })
  // A card expense needs its card, like in kogane-api
  .refine((data) => data.targetType !== "credit_card" || !!data.paymentMethodId, {
    message: "Elige la tarjeta",
    path: ["paymentMethodId"],
  });
type RecurringForm = z.input<typeof recurringFormSchema>;
type RecurringValues = z.output<typeof recurringFormSchema>;

const emptyForm: RecurringForm = {
  description: "",
  amount: 0,
  currency: "PEN",
  targetType: "fixed_cost",
  dayOfMonth: 1,
  personId: "",
  paymentMethodId: null,
  categoryId: null,
  expenseType: "essential",
};

interface RecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurringDialog({ open, onOpenChange }: RecurringDialogProps) {
  const saveRecurring = useSaveExpense(EXPENSE_RESOURCES.recurring);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<
    RecurringForm,
    unknown,
    RecurringValues
  >({ resolver: zodResolver(recurringFormSchema), defaultValues: emptyForm });
  const targetType = watch("targetType");

  useEffect(() => {
    if (open) reset(emptyForm);
  }, [open, reset]);

  const onSubmit = handleSubmit((body) => {
    saveRecurring.mutate({ body }, { onSuccess: () => onOpenChange(false) });
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo gasto recurrente"
      description="Se repite cada mes en el día indicado"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={saveRecurring.isPending}>Crear</Button>
        </>
      }
    >
      <form className="space-y-4 py-2" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción *</label>
          <Input {...register("description")} placeholder="Ej: Alquiler, Gimnasio..." />
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
            <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v as RecurringForm["currency"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo destino *</label>
            <Select value={targetType} onValueChange={(v) => setValue("targetType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RECURRING_TARGETS.map((t) => <SelectItem key={t} value={t}>{RECURRING_TARGET_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Día del mes *</label>
            <Input type="number" min={1} max={31} {...register("dayOfMonth", { valueAsNumber: true })} />
            {errors.dayOfMonth && <p className="text-xs text-destructive">{errors.dayOfMonth.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Persona *</label>
            <PersonSelect value={watch("personId")} onChange={(id) => setValue("personId", id ?? "", { shouldValidate: true })} />
            {errors.personId && <p className="text-xs text-destructive">{errors.personId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{targetType === "credit_card" ? "Tarjeta de crédito *" : "Cuenta"}</label>
            <PaymentMethodSelect
              allowEmpty={targetType !== "credit_card"}
              type={targetType === "credit_card" ? "credit_card" : undefined}
              value={watch("paymentMethodId")}
              onChange={(id) => setValue("paymentMethodId", id, { shouldValidate: true })}
            />
            {errors.paymentMethodId && <p className="text-xs text-destructive">{errors.paymentMethodId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Categoría</label>
            <CategorySelect allowEmpty value={watch("categoryId")} onChange={(id) => setValue("categoryId", id)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de gasto</label>
            <Select value={watch("expenseType")} onValueChange={(v) => setValue("expenseType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPENSE_TYPES.map((t) => <SelectItem key={t} value={t}>{EXPENSE_TYPE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
