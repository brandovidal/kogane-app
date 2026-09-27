import { useFormContext } from "react-hook-form";
import { ArrowLeftRight, Banknote, CircleCheck, Coins, FileText, ListFilter, ReceiptText, Tags, UserRound, WalletCards } from "lucide-react";
import { CategorySelect } from "@/features/categories/components/CategorySelect";
import { PaymentMethodSelect } from "@/features/settings/components/PaymentMethodSelect";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { FormField } from "@/shared/components/forms/FormField";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { CURRENCIES, EXPENSE_TYPE_LABELS, EXPENSE_TYPES } from "@/shared/constants/finance";
import { FIXED_COST_STATUSES } from "@/features/fixed-costs/constants/statuses";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import type { FixedCostForm, FixedCostValues } from "@/features/fixed-costs/lib/fixed-cost-form";

export function FixedCostGeneralSection() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<FixedCostForm, unknown, FixedCostValues>();
  const currency = watch("currency");

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-lg border p-4">
        <h3 className="text-sm font-semibold"><FieldLabel icon={ReceiptText}>Datos del costo</FieldLabel></h3>
        <FormField label="Descripción *" icon={FileText} htmlFor="fixed-cost-description" error={errors.description?.message}>
          <Input id="fixed-cost-description" {...register("description")} placeholder="Ej: Luz, Agua, Gas..." />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <FormField label="Monto *" icon={Banknote} htmlFor="fixed-cost-amount" error={errors.amount?.message}>
            <Input id="fixed-cost-amount" type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Moneda" icon={Coins} htmlFor="fixed-cost-currency">
            <Select value={currency} onValueChange={(value) => setValue("currency", value as FixedCostForm["currency"])}>
              <SelectTrigger id="fixed-cost-currency"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>
        {currency !== "PEN" && (
          <FormField label="Tipo de cambio" icon={ArrowLeftRight} htmlFor="fixed-cost-exchange-rate" error={errors.exchangeRate?.message}>
            <Input
              id="fixed-cost-exchange-rate"
              type="number"
              step="0.001"
              {...register("exchangeRate", { setValueAs: (value) => value === "" || value == null ? null : Number(value) })}
              placeholder="Ej: 3.75"
            />
          </FormField>
        )}
      </section>
      <section className="space-y-3 rounded-lg border p-4">
        <h3 className="text-sm font-semibold"><FieldLabel icon={Tags}>Clasificación y asignación</FieldLabel></h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Categoría *" icon={Tags} error={errors.categoryId?.message}>
            <CategorySelect value={watch("categoryId")} onChange={(id) => setValue("categoryId", id ?? "", { shouldValidate: true })} placeholder="Selecciona categoría" />
          </FormField>
          <FormField label="Tipo de gasto" icon={ListFilter} htmlFor="fixed-cost-type">
            <Select value={watch("expenseType")} onValueChange={(value) => setValue("expenseType", value)}>
              <SelectTrigger id="fixed-cost-type"><SelectValue /></SelectTrigger>
              <SelectContent>{EXPENSE_TYPES.map((value) => <SelectItem key={value} value={value}>{EXPENSE_TYPE_LABELS[value]}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Persona *" icon={UserRound} error={errors.personId?.message}>
            <PersonSelect value={watch("personId")} onChange={(id) => setValue("personId", id ?? "", { shouldValidate: true })} />
          </FormField>
          <FormField label="Cuenta" icon={WalletCards}>
            <PaymentMethodSelect allowEmpty value={watch("paymentMethodId")} onChange={(id) => setValue("paymentMethodId", id)} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Estado" icon={CircleCheck} htmlFor="fixed-cost-status">
              <Select value={watch("paymentStatus")} onValueChange={(value) => setValue("paymentStatus", value)}>
                <SelectTrigger id="fixed-cost-status"><SelectValue /></SelectTrigger>
                <SelectContent>{FIXED_COST_STATUSES.map((status) => <SelectItem key={status} value={status}><StatusBadge status={status} /></SelectItem>)}</SelectContent>
              </Select>
            </FormField>
          </div>
        </div>
      </section>
    </div>
  );
}
