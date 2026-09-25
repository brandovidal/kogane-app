import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { PaymentMethodSelect, PersonSelect } from "@/shared/components/CatalogSelect";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useSaveExpense } from "@/shared/api/hooks/expenses";
import { EXPENSE_RESOURCES, type Subscription } from "@/shared/api/types";
import {
  CURRENCIES,
  EXPENSE_TYPE_LABELS,
  EXPENSE_TYPES,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_PERIOD_LABELS,
  SUBSCRIPTION_PERIODS,
  SUBSCRIPTION_STATUSES,
} from "@/shared/labels";
import { toIsoDate } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";

const subscriptionFormSchema = z.object({
  description: z.string().trim().min(1, "Descripción requerida"),
  amount: z.number({ error: "Monto requerido" }).positive("Monto debe ser positivo"),
  currency: z.enum(CURRENCIES),
  exchangeRate: z.number().positive().nullable(),
  period: z.string().min(1, "Período requerido"),
  expenseType: z.string(),
  paymentStatus: z.string(),
  personId: z.string().min(1, "Persona requerida"),
  paymentMethodId: z.string().nullable(),
  dueDate: z.string(),
  notes: z.string().trim().transform((value) => value || null),
  supplyNumber: z.string().trim().max(40).transform((value) => value || null),
});
type SubscriptionForm = z.input<typeof subscriptionFormSchema>;
type SubscriptionValues = z.output<typeof subscriptionFormSchema>;

const emptyForm: SubscriptionForm = {
  description: "",
  amount: 0,
  currency: "PEN",
  exchangeRate: null,
  period: "monthly",
  expenseType: "essential",
  paymentStatus: "not_started",
  personId: "",
  paymentMethodId: null,
  dueDate: "",
  notes: "",
  supplyNumber: "",
};

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription;
}

export function SubscriptionDialog({ open, onOpenChange, subscription }: SubscriptionDialogProps) {
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.subscription);
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const isEdit = !!subscription;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<
    SubscriptionForm,
    unknown,
    SubscriptionValues
  >({ resolver: zodResolver(subscriptionFormSchema), defaultValues: emptyForm });
  const currency = watch("currency");

  useEffect(() => {
    if (!open) return;
    reset(
      subscription
        ? {
            description: subscription.description,
            amount: subscription.amount,
            currency: subscription.currency as SubscriptionForm["currency"],
            exchangeRate: subscription.exchangeRate,
            period: subscription.period,
            expenseType: subscription.expenseType,
            paymentStatus: subscription.paymentStatus,
            personId: subscription.personId,
            paymentMethodId: subscription.paymentMethodId,
            dueDate: toIsoDate(subscription.dueDate),
            notes: subscription.notes ?? "",
            supplyNumber: subscription.supplyNumber ?? "",
          }
        : emptyForm,
    );
  }, [open, subscription, reset]);

  const onSubmit = handleSubmit((data) => {
    const body = {
      ...data,
      exchangeRate: data.currency === "PEN" ? null : data.exchangeRate,
      dueDate: data.dueDate || null,
      ...(isEdit ? {} : { paymentMonth: month, paymentYear: year }),
    };
    saveExpense.mutate({ id: subscription?.id, body }, { onSuccess: () => onOpenChange(false) });
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar plataforma" : "Nueva plataforma"}
      description={isEdit ? "Modifica los datos de la suscripción" : "Agrega una nueva suscripción"}
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
          <Input {...register("description")} placeholder="Ej: Netflix, Spotify..." />
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
            <Select value={currency} onValueChange={(v) => setValue("currency", v as SubscriptionForm["currency"])}>
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
            <label className="text-sm font-medium">Período *</label>
            <Select value={watch("period")} onValueChange={(v) => setValue("period", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_PERIODS.map((p) => <SelectItem key={p} value={p}>{SUBSCRIPTION_PERIOD_LABELS[p]}</SelectItem>)}
              </SelectContent>
            </Select>
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Estado</label>
            <Select value={watch("paymentStatus")} onValueChange={(v) => setValue("paymentStatus", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_STATUSES.map((s) => <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha vencimiento</label>
            <Input type="date" {...register("dueDate")} />
          </div>
        </div>

        {subscription && subscription.kind !== "platform" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">N.º de suministro</label>
            <Input {...register("supplyNumber")} placeholder="Ej: 987654321" />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Comentario</label>
          <Input {...register("notes")} placeholder="Nota adicional..." />
        </div>
      </form>
    </ResponsiveDialog>
  );
}
