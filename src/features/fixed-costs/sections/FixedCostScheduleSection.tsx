import { useFormContext } from "react-hook-form";
import { CalendarClock, CalendarDays, CalendarRange } from "lucide-react";
import { InstallmentFields } from "@/features/expenses/components/forms/InstallmentFields";
import { DatePicker } from "@/shared/components/forms/DatePicker";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { FormField } from "@/shared/components/forms/FormField";
import {
  PERIOD_MONTH_OPTIONS,
  PERIOD_YEAR_OPTIONS,
} from "@/shared/constants/period";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Switch } from "@/ui/switch";
import type {
  FixedCostForm,
  FixedCostValues,
} from "@/features/fixed-costs/lib/fixed-cost-form";

export function FixedCostScheduleSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FixedCostForm, unknown, FixedCostValues>();
  const hasInstallments = watch("hasInstallments");

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-lg border p-4">
        <div>
          <h3 className="text-sm font-semibold">
            <FieldLabel icon={CalendarRange}>Periodo del registro</FieldLabel>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Indica el mes al que pertenece este costo fijo.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            label="Mes"
            icon={CalendarDays}
            htmlFor="fixed-cost-month"
            error={errors.paymentMonth?.message}
          >
            <Select
              value={String(watch("paymentMonth"))}
              onValueChange={(value) => setValue("paymentMonth", Number(value))}
            >
              <SelectTrigger
                id="fixed-cost-month"
                aria-label="Mes del registro"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_MONTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Año"
            icon={CalendarRange}
            htmlFor="fixed-cost-year"
            error={errors.paymentYear?.message}
          >
            <Select
              value={String(watch("paymentYear"))}
              onValueChange={(value) => setValue("paymentYear", Number(value))}
            >
              <SelectTrigger id="fixed-cost-year" aria-label="Año del registro">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_YEAR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </section>
      <section className="space-y-3 rounded-lg border p-4">
        <div>
          <h3 className="text-sm font-semibold">
            <FieldLabel icon={CalendarClock}>Vencimiento y cuotas</FieldLabel>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Programa cuándo vence y registra el avance de pagos en cuotas.
          </p>
        </div>
        <FormField
          label="Fecha de vencimiento"
          icon={CalendarDays}
          error={errors.dueDate?.message}
        >
          <DatePicker
            ariaLabel="Fecha de vencimiento"
            value={watch("dueDate")}
            onChange={(date) =>
              setValue("dueDate", date, { shouldValidate: true })
            }
            placeholder="Sin fecha de vencimiento"
          />
        </FormField>
        <div className="space-y-3 rounded-md bg-muted/30 p-3">
          <label className="flex items-center justify-between gap-3 text-sm font-medium">
            Se paga en cuotas
            <Switch
              checked={hasInstallments}
              onCheckedChange={(checked) =>
                setValue("hasInstallments", checked, {
                  shouldValidate: !checked,
                })
              }
            />
          </label>
          {hasInstallments && (
            <InstallmentFields
              value={watch("installment")}
              onChange={(value) =>
                setValue("installment", value ?? "", {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={errors.installment?.message}
            />
          )}
        </div>
      </section>
    </div>
  );
}
