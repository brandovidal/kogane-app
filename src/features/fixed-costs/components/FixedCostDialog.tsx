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
import { EXPENSE_RESOURCES, type FixedCost } from "@/shared/api/types";
import { CURRENCIES, EXPENSE_TYPE_LABELS, EXPENSE_TYPES, FIXED_COST_STATUSES, PAYMENT_STATUS_LABELS } from "@/shared/labels";
import { toIsoDate } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";

const optionalText = z.string().trim().transform((value) => value || null);

const fixedCostFormSchema = z.object({
  description: z.string().trim().min(1, "Descripción requerida"),
  amount: z.number({ error: "Monto requerido" }).positive("Monto debe ser positivo"),
  currency: z.enum(CURRENCIES),
  exchangeRate: z.number().positive().nullable(),
  expenseType: z.string(),
  paymentStatus: z.string(),
  personId: z.string().min(1, "Persona requerida"),
  paymentMethodId: z.string().nullable(),
  categoryId: z.string().min(1, "Categoría requerida"),
  dueDate: z.string(),
  installment: optionalText.refine((value) => !value || /^\d{1,3}\/\d{1,3}$/.test(value), "Usa n/m, ej: 3/6"),
  notes: optionalText,
});
type FixedCostForm = z.input<typeof fixedCostFormSchema>;
type FixedCostValues = z.output<typeof fixedCostFormSchema>;

const emptyForm: FixedCostForm = {
  description: "",
  amount: 0,
  currency: "PEN",
  exchangeRate: null,
  expenseType: "essential",
  paymentStatus: "not_started",
  personId: "",
  paymentMethodId: null,
  categoryId: "",
  dueDate: "",
  installment: "",
  notes: "",
};

interface FixedCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedCost?: FixedCost;
}

export function FixedCostDialog({ open, onOpenChange, fixedCost }: FixedCostDialogProps) {
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.fixedCost);
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const isEdit = !!fixedCost;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FixedCostForm, unknown, FixedCostValues>({
    resolver: zodResolver(fixedCostFormSchema),
    defaultValues: emptyForm,
  });
  const currency = watch("currency");

  useEffect(() => {
    if (!open) return;
    reset(
      fixedCost
        ? {
            description: fixedCost.description,
            amount: fixedCost.amount,
            currency: fixedCost.currency as FixedCostForm["currency"],
            exchangeRate: fixedCost.exchangeRate,
            expenseType: fixedCost.expenseType,
            paymentStatus: fixedCost.paymentStatus,
            personId: fixedCost.personId,
            paymentMethodId: fixedCost.paymentMethodId,
            categoryId: fixedCost.categoryId,
            dueDate: toIsoDate(fixedCost.dueDate),
            installment: fixedCost.installment ?? "",
            notes: fixedCost.notes ?? "",
          }
        : emptyForm,
    );
  }, [open, fixedCost, reset]);

  const onSubmit = handleSubmit((data) => {
    const body = {
      ...data,
      exchangeRate: data.currency === "PEN" ? null : data.exchangeRate,
      dueDate: data.dueDate || null,
      // a new one goes to the month on screen; editing keeps its month
      ...(isEdit ? {} : { paymentMonth: month, paymentYear: year }),
    };
    saveExpense.mutate({ id: fixedCost?.id, body }, { onSuccess: () => onOpenChange(false) });
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar gasto fijo" : "Nuevo gasto fijo"}
      description={isEdit ? "Modifica los datos del gasto" : "Agrega un nuevo costo fijo"}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={saveExpense.isPending}>
            {isEdit ? "Guardar" : "Crear"}
          </Button>
        </>
      }
    >
      <form className="space-y-4 py-2" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción *</label>
          <Input {...register("description")} placeholder="Ej: Luz, Agua, Gas..." />
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
            <Select value={currency} onValueChange={(v) => setValue("currency", v as FixedCostForm["currency"])}>
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
                {FIXED_COST_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>
                ))}
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
            <label className="text-sm font-medium">Cuenta</label>
            <PaymentMethodSelect allowEmpty value={watch("paymentMethodId")} onChange={(id) => setValue("paymentMethodId", id)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Categoría *</label>
          <CategorySelect
            value={watch("categoryId")}
            onChange={(id) => setValue("categoryId", id ?? "", { shouldValidate: true })}
            placeholder="Selecciona categoría"
          />
          {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha vencimiento</label>
            <Input type="date" {...register("dueDate")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cuotas</label>
            <Input {...register("installment")} placeholder="Ej: 3/6" />
            {errors.installment && <p className="text-xs text-destructive">{errors.installment.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Observación</label>
          <Input {...register("notes")} placeholder="Nota adicional..." />
        </div>
      </form>
    </ResponsiveDialog>
  );
}
