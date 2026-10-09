import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  CalendarClock,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";
import { InstallmentFields } from "@/features/expenses/components/forms/InstallmentFields";
import { DatePicker } from "@/shared/components/forms/DatePicker";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { FormField } from "@/shared/components/forms/FormField";
import { MonthYearPicker } from "@/shared/components/navigation/MonthYearPicker";
import { Switch } from "@/ui/switch";
import { parseInstallment } from "@/features/expenses/lib/installments";
import { daysUntilDue } from "@/features/fixed-costs/lib/fixed-cost-summary";
import { relativeDueLabel } from "@/features/fixed-costs/lib/fixed-cost-views";
import { localTodayKey } from "@/shared/lib/dates";
import { cn } from "@/shared/utils/cn";
import type {
  FixedCostForm,
  FixedCostValues,
} from "@/features/fixed-costs/lib/fixed-cost-form";

export function FixedCostScheduleSection() {
  const [todayKey, setTodayKey] = useState("");
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FixedCostForm, unknown, FixedCostValues>();
  const hasInstallments = watch("hasInstallments");
  const installment = watch("installment");
  const { current, total } = parseInstallment(installment);
  const currentInstallment = Number(current);
  const totalInstallments = Number(total);
  const hasValidInstallment =
    currentInstallment > 0 &&
    totalInstallments > 0 &&
    currentInstallment <= totalInstallments;
  const paidInstallments = hasValidInstallment ? currentInstallment - 1 : 0;
  const remainingInstallments = hasValidInstallment
    ? totalInstallments - paidInstallments
    : 0;
  const progress = hasValidInstallment
    ? Math.round((paidInstallments / totalInstallments) * 100)
    : 0;
  const periodMonth = watch("paymentMonth");
  const periodYear = watch("paymentYear");
  const dueDate = watch("dueDate");
  const daysToDue =
    dueDate && todayKey ? daysUntilDue(dueDate, todayKey) : null;
  const dueRelativeLabel = relativeDueLabel(daysToDue);
  const dueMessage =
    daysToDue == null || !dueRelativeLabel
      ? null
      : daysToDue < 0
        ? dueRelativeLabel.replace(/^v/, "V")
        : daysToDue === 0
          ? "Vence hoy"
          : `Vence ${dueRelativeLabel}`;
  const finishDate = new Date(
    periodYear,
    periodMonth - 1 + remainingInstallments - 1,
    1,
  );
  const finishLabel = finishDate.toLocaleDateString("es-PE", {
    month: "short",
    year: "numeric",
  });

  useEffect(() => setTodayKey(localTodayKey()), []);

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
            error={errors.paymentMonth?.message ?? errors.paymentYear?.message}
          >
            <MonthYearPicker
              ariaLabel="Periodo del registro"
              value={{ month: periodMonth, year: periodYear }}
              onChange={({ month, year }) => {
                setValue("paymentMonth", month, { shouldValidate: true });
                setValue("paymentYear", year, { shouldValidate: true });
              }}
            />
          </FormField>
          <FormField
            label="Vencimiento"
            icon={CalendarDays}
            error={errors.dueDate?.message}
          >
            <DatePicker
              ariaLabel="Fecha de vencimiento"
              value={dueDate}
              onChange={(date) =>
                setValue("dueDate", date, { shouldValidate: true })
              }
              placeholder="Sin fecha de vencimiento"
            />
            {dueMessage && daysToDue != null && (
              <p
                className={cn(
                  "mt-1 text-xs",
                  daysToDue < 0
                    ? "text-destructive"
                    : "text-amber-600 dark:text-amber-300",
                )}
              >
                {dueMessage}
              </p>
            )}
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
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(15rem,0.9fr)_minmax(0,1.1fr)] lg:items-end">
              <InstallmentFields
                compact
                value={installment}
                onChange={(value) =>
                  setValue("installment", value ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                error={errors.installment?.message}
              />
              <div className="space-y-2 pb-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ChartNoAxesColumnIncreasing
                      aria-hidden="true"
                      className="size-3.5"
                    />
                    Avance
                  </span>
                  <span>{hasValidInstallment ? `${progress}%` : "—"}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Avance de cuotas pagadas"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-2 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-brand transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            {hasValidInstallment && (
              <div className="grid grid-cols-3 gap-2">
                <InstallmentSummary
                  label="Pagadas"
                  value={String(paidInstallments)}
                />
                <InstallmentSummary
                  label="Restantes"
                  value={String(remainingInstallments)}
                />
                <InstallmentSummary label="Termina" value={finishLabel} />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function InstallmentSummary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-muted/50 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
