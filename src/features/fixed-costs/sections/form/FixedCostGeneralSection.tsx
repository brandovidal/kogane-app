import { useFormContext } from "react-hook-form";
import {
  ArrowLeftRight,
  Banknote,
  ChevronDown,
  CircleCheck,
  FileText,
  ListFilter,
  ReceiptText,
  Tags,
  UserRound,
  WalletCards,
} from "lucide-react";
import { CategorySelect } from "@/features/categories/components/CategorySelect";
import { PaymentMethodSelect } from "@/features/settings/components/PaymentMethodSelect";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { FormField } from "@/shared/components/forms/FormField";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import {
  CURRENCIES,
  EXPENSE_TYPE_LABELS,
  EXPENSE_TYPES,
} from "@/shared/constants/finance";
import { FIXED_COST_STATUSES } from "@/features/fixed-costs/constants/statuses";
import { groupPaymentStatuses } from "@/features/expenses/lib/group-payment-statuses";
import { Input } from "@/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import type {
  FixedCostForm,
  FixedCostValues,
} from "@/features/fixed-costs/lib/fixed-cost-form";

export function FixedCostGeneralSection() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FixedCostForm, unknown, FixedCostValues>();
  const currency = watch("currency");

  return (
    <div className="space-y-3">
      <section className="space-y-4 rounded-xl border border-border/80 bg-card/40 p-4 sm:p-5">
        <FormField
          label="Descripción *"
          icon={FileText}
          htmlFor="fixed-cost-description"
          error={errors.description?.message}
        >
          <Input
            id="fixed-cost-description"
            {...register("description")}
            placeholder="Ej: Luz, Agua, Gas..."
          />
        </FormField>
        <div>
          <FormField
            label="Monto *"
            icon={Banknote}
            htmlFor="fixed-cost-amount"
            error={errors.amount?.message}
          >
            <InputGroup className="bg-background/50">
              <InputGroupInput
                id="fixed-cost-amount"
                type="number"
                step="0.01"
                aria-invalid={!!errors.amount}
                {...register("amount", { valueAsNumber: true })}
              />
              <InputGroupAddon>
                <InputGroupText>
                  {currency === "USD" ? "$" : "S/"}
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupAddon
                align="inline-end"
                className="h-full border-l px-1.5"
              >
                <Select
                  value={currency}
                  onValueChange={(value) =>
                    setValue("currency", value as FixedCostForm["currency"])
                  }
                >
                  <SelectTrigger
                    asChild
                    aria-label="Moneda del monto"
                    className="h-7 w-auto border-0 bg-transparent px-2 py-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                  >
                    <InputGroupButton
                      className="h-7 gap-1.5 px-2"
                      variant="ghost"
                    >
                      <SelectValue />
                      <ChevronDown
                        aria-hidden="true"
                        className="size-4 opacity-50"
                      />
                    </InputGroupButton>
                  </SelectTrigger>
                  <SelectContent align="end">
                    {CURRENCIES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputGroupAddon>
            </InputGroup>
          </FormField>
        </div>
        {currency !== "PEN" && (
          <FormField
            label="Tipo de cambio"
            icon={ArrowLeftRight}
            htmlFor="fixed-cost-exchange-rate"
            error={errors.exchangeRate?.message}
          >
            <Input
              id="fixed-cost-exchange-rate"
              type="number"
              step="0.001"
              {...register("exchangeRate", {
                setValueAs: (value) =>
                  value === "" || value == null ? null : Number(value),
              })}
              placeholder="Ej: 3.75"
            />
          </FormField>
        )}
      </section>
      <section className="space-y-4 rounded-xl border border-border/80 bg-card/40 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Categoría *"
            icon={Tags}
            error={errors.categoryId?.message}
          >
            <CategorySelect
              className="w-full"
              value={watch("categoryId")}
              onChange={(id) =>
                setValue("categoryId", id ?? "", { shouldValidate: true })
              }
              placeholder="Selecciona categoría"
            />
          </FormField>
          <FormField
            label="Persona *"
            icon={UserRound}
            error={errors.personId?.message}
          >
            <PersonSelect
              className="w-full"
              value={watch("personId")}
              onChange={(id) =>
                setValue("personId", id ?? "", { shouldValidate: true })
              }
            />
          </FormField>
          <FormField
            label="Tipo de gasto"
            icon={ListFilter}
            htmlFor="fixed-cost-type"
          >
            <Select
              value={watch("expenseType")}
              onValueChange={(value) => setValue("expenseType", value)}
            >
              <SelectTrigger id="fixed-cost-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {EXPENSE_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Cuenta" icon={WalletCards}>
            <PaymentMethodSelect
              className="w-full"
              allowEmpty
              value={watch("paymentMethodId")}
              onChange={(id) => setValue("paymentMethodId", id)}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField
              label="Estado"
              icon={CircleCheck}
              htmlFor="fixed-cost-status"
            >
              <Select
                value={watch("paymentStatus")}
                onValueChange={(value) => setValue("paymentStatus", value)}
              >
                <SelectTrigger id="fixed-cost-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupPaymentStatuses(FIXED_COST_STATUSES).map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.options.map((status) => (
                        <SelectItem key={status} value={status}>
                          <StatusBadge status={status} />
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>
      </section>
    </div>
  );
}
