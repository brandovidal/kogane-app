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
    <div className="space-y-3">
      <section className="space-y-4 rounded-xl border border-border/80 bg-card/40 p-4 sm:p-5">
        <div>
          <h3 className="text-sm font-semibold">
            <FieldLabel icon={CalendarClock}>Periodo y vencimiento</FieldLabel>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Define el mes al que pertenece el costo y cuándo vence.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Periodo del registro"
            icon={CalendarRange}
            error={errors.paymentMonth?.message ?? errors.paymentYear?.message}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
              <Select
                value={String(watch("paymentMonth"))}
                onValueChange={(value) => setValue("paymentMonth", Number(value))}
              >
                <SelectTrigger id="fixed-cost-month" aria-label="Mes del registro">
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
            </div>
          </FormField>
          <FormField
            label="Vencimiento"
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
        </div>
      </section>
      <section className="space-y-4 rounded-xl border border-border/80 bg-card/40 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Se paga en cuotas</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Lleva el avance del préstamo o financiamiento.
            </p>
          </div>
          <Switch
            aria-label="Se paga en cuotas"
            checked={hasInstallments}
            onCheckedChange={(checked) =>
              setValue("hasInstallments", checked, {
                shouldValidate: !checked,
              })
            }
          />
        </div>
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
      </section>
    </div>
  );
}
