import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { ShareEditor } from "@/features/drafts/components/ShareEditor";
import type { DraftFields } from "@/features/drafts/hooks/drafts";
import { CategorySelect } from "@/features/categories/components/CategorySelect";
import { PaymentMethodSelect } from "@/features/settings/components/PaymentMethodSelect";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { useSaveExpense } from "@/features/expenses/hooks/expenses";
import { EXPENSE_RESOURCES, type RecurringExpense } from "@/shared/api/types";
import {
  CURRENCIES,
  EXPENSE_TYPE_LABELS,
  EXPENSE_TYPES,
} from "@/shared/constants/finance";
import {
  RECURRING_TARGET_LABELS,
  RECURRING_TARGETS,
} from "@/features/recurring/constants/recurring";
import {
  SUBSCRIPTION_KIND_LABELS,
  SUBSCRIPTION_PERIOD_LABELS,
  SUBSCRIPTION_PERIODS,
} from "@/features/subscriptions/constants/subscriptions";

const recurringFormSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, "Escribe un nombre para el recurrente"),
    amount: z
      .number({ error: "Monto requerido" })
      .positive("Monto debe ser positivo"),
    currency: z.enum(CURRENCIES),
    targetType: z.string(),
    dayOfMonth: z.number({ error: "Día requerido" }).int().min(1).max(31),
    personId: z.string().min(1, "Persona requerida"),
    paymentMethodId: z.string().nullable(),
    categoryId: z.string().nullable(),
    expenseType: z.string(),
    // Only for subscriptions (D107): what it is, how often it comes back and its supply number
    kind: z.string(),
    period: z.string(),
    supplyNumber: z.string().trim().max(40),
    isActive: z.boolean(),
  })
  // A card expense needs its card, like in kogane-api
  .refine(
    (data) => data.targetType !== "credit_card" || !!data.paymentMethodId,
    {
      message: "Elige la tarjeta",
      path: ["paymentMethodId"],
    },
  );
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
  kind: "service",
  period: "monthly",
  supplyNumber: "",
  isActive: true,
};

interface RecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurring?: RecurringExpense;
}

export function RecurringDialog({
  open,
  onOpenChange,
  recurring,
}: RecurringDialogProps) {
  const saveRecurring = useSaveExpense(EXPENSE_RESOURCES.recurring);
  const isEdit = !!recurring;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecurringForm, unknown, RecurringValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: emptyForm,
  });
  const targetType = watch("targetType");
  // Shared with people (Netflix a medias): each month the row keeps their part and they get their cobro (P30)
  const [sharedWith, setSharedWith] = useState<DraftFields["sharedWith"]>(null);

  useEffect(() => {
    if (open) {
      reset(emptyForm);
      if (recurring) {
        reset({
          description: recurring.description,
          amount: recurring.amount,
          currency: recurring.currency as RecurringForm["currency"],
          targetType: recurring.targetType,
          dayOfMonth: recurring.dayOfMonth,
          personId: recurring.personId,
          paymentMethodId: recurring.paymentMethodId,
          categoryId: recurring.categoryId,
          expenseType: recurring.expenseType,
          kind: recurring.kind,
          period: recurring.period,
          supplyNumber: recurring.supplyNumber ?? "",
          isActive: recurring.isActive,
        });
        setSharedWith(recurring.sharedWith);
      } else {
        setSharedWith(null);
      }
    }
  }, [open, recurring, reset]);

  const onSubmit = handleSubmit(({ kind, period, supplyNumber, ...rest }) => {
    const subscription = rest.targetType === "subscription";
    const shares = sharedWith?.shares.filter((share) => share.personId) ?? [];
    const body = {
      ...(subscription
        ? { ...rest, kind, period, supplyNumber: supplyNumber || null }
        : rest),
      sharedWith: shares.length ? { shares } : null,
    };
    saveRecurring.mutate(
      { id: recurring?.id, body },
      { onSuccess: () => onOpenChange(false) },
    );
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar recurrente" : "Nuevo recurrente"}
      description={
        isEdit
          ? `Modifica la plantilla de ${recurring.description}. Los cambios aplican desde el próximo mes; los meses ya generados no se modifican.`
          : "Se repite cada período. Elige dónde registrarlo."
      }
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={saveRecurring.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <form className="space-y-4 py-2" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción *</label>
          <Input
            {...register("description")}
            placeholder="Ej: Alquiler, Gimnasio..."
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Monto *</label>
            <Input
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Moneda</label>
            <Select
              value={watch("currency")}
              onValueChange={(v) =>
                setValue("currency", v as RecurringForm["currency"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Registrar en *</label>
            <Select
              value={targetType}
              onValueChange={(v) => setValue("targetType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRING_TARGETS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {RECURRING_TARGET_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Día del mes *</label>
            <Input
              type="number"
              min={1}
              max={31}
              {...register("dayOfMonth", { valueAsNumber: true })}
            />
            {errors.dayOfMonth && (
              <p className="text-xs text-destructive">
                {errors.dayOfMonth.message}
              </p>
            )}
          </div>
        </div>

        {targetType === "subscription" && (
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={watch("kind")}
                onValueChange={(v) => setValue("kind", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUBSCRIPTION_KIND_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Período</label>
              <Select
                value={watch("period")}
                onValueChange={(v) => setValue("period", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {SUBSCRIPTION_PERIOD_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">N.º de suministro</label>
              <Input {...register("supplyNumber")} placeholder="Opcional" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Persona *</label>
            <PersonSelect
              value={watch("personId")}
              onChange={(id) =>
                setValue("personId", id ?? "", { shouldValidate: true })
              }
            />
            {errors.personId && (
              <p className="text-xs text-destructive">
                {errors.personId.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {targetType === "credit_card" ? "Tarjeta de crédito *" : "Cuenta"}
            </label>
            <PaymentMethodSelect
              allowEmpty={targetType !== "credit_card"}
              type={targetType === "credit_card" ? "credit_card" : undefined}
              value={watch("paymentMethodId")}
              onChange={(id) =>
                setValue("paymentMethodId", id, { shouldValidate: true })
              }
            />
            {errors.paymentMethodId && (
              <p className="text-xs text-destructive">
                {errors.paymentMethodId.message}
              </p>
            )}
          </div>
        </div>

        <ShareEditor
          value={sharedWith}
          total={watch("amount")}
          currency={watch("currency")}
          onChange={setSharedWith}
        />

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              Generar automáticamente cada mes
            </p>
            <p className="text-xs text-muted-foreground">
              Se crea el registro el día de cobro, sin que tengas que hacerlo.
            </p>
          </div>
          <Switch
            checked={watch("isActive")}
            onCheckedChange={(checked) => setValue("isActive", checked)}
            aria-label="Generar automáticamente"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Categoría</label>
            <CategorySelect
              allowEmpty
              value={watch("categoryId")}
              onChange={(id) => setValue("categoryId", id)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de gasto</label>
            <Select
              value={watch("expenseType")}
              onValueChange={(v) => setValue("expenseType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {EXPENSE_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
