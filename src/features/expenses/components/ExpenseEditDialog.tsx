import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useSaveExpense } from "@/shared/api/hooks/expenses";
import { EXPENSE_RESOURCES, type CreditCardExpense, type DailyExpense } from "@/shared/api/types";
import { CategorySelect, PaymentMethodSelect, PersonSelect } from "@/shared/components/CatalogSelect";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import {
  CREDIT_CARD_STATUSES,
  CURRENCIES,
  EXPENSE_TYPE_LABELS,
  EXPENSE_TYPES,
  PAYMENT_STATUS_LABELS,
} from "@/shared/labels";
import { getMonthName, toIsoDate } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const optionalText = z.string().trim().transform((value) => value || null);

const formSchema = z.object({
  description: z.string().trim().min(1, "Descripción requerida").max(120),
  amount: z.number({ error: "Monto requerido" }).positive("Monto debe ser positivo"),
  currency: z.enum(CURRENCIES),
  exchangeRate: z.number().positive().nullable(),
  expenseType: z.string(),
  personId: z.string().min(1, "Persona requerida"),
  categoryId: z.string().nullable(),
  paymentMethodId: z.string().min(1, "Medio de pago requerido"),
  date: z.string(),
  merchant: optionalText,
  installment: optionalText.refine((value) => !value || /^\d{1,3}\/\d{1,3}$/.test(value), "Usa n/m, ej: 3/6"),
  paymentStatus: z.string(),
  paymentMonth: z.number().int().min(1).max(12),
  paymentYear: z.number().int().min(2020).max(2100),
  notes: optionalText,
});
type ExpenseForm = z.input<typeof formSchema>;
type ExpenseValues = z.output<typeof formSchema>;

type Editable =
  | { resource: typeof EXPENSE_RESOURCES.daily; expense: DailyExpense }
  | { resource: typeof EXPENSE_RESOURCES.creditCard; expense: CreditCardExpense };

interface ExpenseEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Editable["resource"];
  expense?: DailyExpense | CreditCardExpense;
}

function toForm(target: Editable): ExpenseForm {
  const base = {
    description: target.expense.description,
    amount: target.expense.amount,
    currency: target.expense.currency as ExpenseForm["currency"],
    exchangeRate: target.expense.exchangeRate,
    expenseType: target.expense.expenseType,
    personId: target.expense.personId,
    categoryId: target.expense.categoryId,
    notes: target.expense.notes ?? "",
  };
  if (target.resource === EXPENSE_RESOURCES.daily) {
    const { expense } = target;
    return {
      ...base,
      paymentMethodId: expense.paymentMethodId,
      date: toIsoDate(expense.spentAt),
      merchant: expense.merchant ?? "",
      installment: "",
      paymentStatus: "paid",
      paymentMonth: Number(expense.spentAt.slice(5, 7)),
      paymentYear: Number(expense.spentAt.slice(0, 4)),
    };
  }
  const { expense } = target;
  return {
    ...base,
    paymentMethodId: expense.paymentMethodId,
    date: toIsoDate(expense.processDate),
    merchant: "",
    installment: expense.installment ?? "",
    paymentStatus: expense.paymentStatus,
    paymentMonth: expense.paymentMonth,
    paymentYear: expense.paymentYear,
  };
}

// Editar a row of Día a día or of a card (the other tables have their own dialog). New expenses come from Nuevo gasto
// or the chat; a split is changed from the bot with /editar (D76)
export function ExpenseEditDialog({ open, onOpenChange, resource, expense }: ExpenseEditDialogProps) {
  const saveExpense = useSaveExpense(resource);
  const isCard = resource === EXPENSE_RESOURCES.creditCard;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseForm, unknown, ExpenseValues>({ resolver: zodResolver(formSchema) });
  const currency = watch("currency");

  useEffect(() => {
    if (open && expense) reset(toForm({ resource, expense } as Editable));
  }, [open, expense, resource, reset]);

  const onSubmit = handleSubmit((data) => {
    if (!expense) return;
    const common = {
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      exchangeRate: data.currency === "PEN" ? null : data.exchangeRate,
      expenseType: data.expenseType,
      personId: data.personId,
      categoryId: data.categoryId,
      paymentMethodId: data.paymentMethodId,
      notes: data.notes,
    };
    const body = isCard
      ? {
          ...common,
          processDate: data.date || null,
          installment: data.installment,
          paymentStatus: data.paymentStatus,
          paymentMonth: data.paymentMonth,
          paymentYear: data.paymentYear,
        }
      : { ...common, spentAt: data.date, merchant: data.merchant };
    saveExpense.mutate({ id: expense.id, body }, { onSuccess: () => onOpenChange(false) });
  });

  const shared = (expense?.othersShare ?? 0) > 0;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isCard ? "Editar gasto de tarjeta" : "Editar gasto"}
      description={shared ? "Es un gasto compartido: el reparto se cambia desde el bot con /editar." : "Modifica los datos del gasto"}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={saveExpense.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <form className="space-y-4 py-2" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción *</label>
          <Input {...register("description")} />
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
            <Select value={currency} onValueChange={(value) => setValue("currency", value as ExpenseForm["currency"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
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
              {...register("exchangeRate", { setValueAs: (value) => (value === "" || value == null ? null : Number(value)) })}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{isCard ? "Fecha de proceso" : "Fecha *"}</label>
            <Input type="date" {...register("date")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{isCard ? "Tarjeta *" : "Medio de pago *"}</label>
            <PaymentMethodSelect
              type={isCard ? "credit_card" : undefined}
              value={watch("paymentMethodId")}
              onChange={(id) => setValue("paymentMethodId", id ?? "", { shouldValidate: true })}
            />
            {errors.paymentMethodId && <p className="text-xs text-destructive">{errors.paymentMethodId.message}</p>}
          </div>
        </div>

        {isCard && (
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mes de pago</label>
              <Select
                value={String(watch("paymentMonth") ?? "")}
                onValueChange={(value) => setValue("paymentMonth", Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, index) => (
                    <SelectItem key={index + 1} value={String(index + 1)}>
                      {getMonthName(index + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Año</label>
              <Input type="number" {...register("paymentYear", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cuota</label>
              <Input {...register("installment")} placeholder="3/6" />
              {errors.installment && <p className="text-xs text-destructive">{errors.installment.message}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Persona *</label>
            <PersonSelect value={watch("personId")} onChange={(id) => setValue("personId", id ?? "", { shouldValidate: true })} />
            {errors.personId && <p className="text-xs text-destructive">{errors.personId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Categoría</label>
            <CategorySelect allowEmpty value={watch("categoryId")} onChange={(id) => setValue("categoryId", id)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de gasto</label>
            <Select value={watch("expenseType")} onValueChange={(value) => setValue("expenseType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {EXPENSE_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isCard ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Estado</label>
              <Select value={watch("paymentStatus")} onValueChange={(value) => setValue("paymentStatus", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_CARD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {PAYMENT_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Comercio</label>
              <Input {...register("merchant")} />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notas</label>
          <Input {...register("notes")} />
        </div>
      </form>
    </ResponsiveDialog>
  );
}
