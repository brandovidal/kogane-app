import { CalendarClock, CalendarDays } from "lucide-react";
import { InstallmentFields } from "@/features/expenses/components/forms/InstallmentFields";
import { installmentError } from "@/features/expenses/lib/installments";
import { DatePicker } from "@/shared/components/forms/DatePicker";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { FormField } from "@/shared/components/forms/FormField";
import { Switch } from "@/ui/switch";
import type { DraftFormSectionProps } from "../types/draft-form";

export function FixedCostDraftScheduleSection({ value, onChange, missingFields }: DraftFormSectionProps) {
  const hasInstallments = value.installment != null;
  return (
    <section className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold"><FieldLabel icon={CalendarClock}>Fecha y cuotas</FieldLabel></h3>
      <FormField label="Fecha del gasto" icon={CalendarDays} missing={missingFields.includes("spentAt")}>
        <DatePicker value={value.spentAt} onChange={(date) => onChange({ ...value, spentAt: date || null })} ariaLabel="Fecha del gasto" />
      </FormField>
      <div className="space-y-3 rounded-md bg-muted/30 p-3">
        <label className="flex items-center justify-between gap-3 text-sm font-medium">
          Se paga en cuotas
          <Switch checked={hasInstallments} onCheckedChange={(checked) => onChange({ ...value, installment: checked ? "1/" : null })} />
        </label>
        {hasInstallments && <InstallmentFields value={value.installment} onChange={(installment) => onChange({ ...value, installment: installment ?? "/" })} missing={missingFields.includes("installment")} error={installmentError(value.installment, true)} />}
      </div>
    </section>
  );
}
