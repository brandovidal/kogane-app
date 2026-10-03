import { useId } from "react";
import { CalendarDays } from "lucide-react";
import type { IncomeFormController } from "../hooks/useIncomeForm";
import { FormField } from "@/shared/components/forms/FormField";
import { DatePicker } from "@/shared/components/forms/DatePicker";
import { PeriodFields } from "@/shared/components/forms/PeriodFields";

export function IncomeScheduleSection({
  form,
}: {
  form: IncomeFormController;
}) {
  const id = useId();
  return (
    <section
      className="space-y-4 rounded-lg border p-4"
      aria-labelledby={`${id}-title`}
    >
      <h3 id={`${id}-title`} className="text-sm font-semibold">
        Fecha y período
      </h3>
      <FormField
        label="Fecha de recepción *"
        icon={CalendarDays}
        error={form.errorFor("receivedAt")}
      >
        <DatePicker
          ariaLabel="Fecha de recepción"
          value={form.value.receivedAt}
          onChange={(value) => {
            form.update("receivedAt", value);
            form.touch("receivedAt");
          }}
        />
      </FormField>
      <div className="space-y-2">
        <PeriodFields
          value={form.value}
          onChange={(period) =>
            form.setValue((current) => ({ ...current, ...period }))
          }
          disabled={form.pending}
          ariaLabel="Período del ingreso"
        />
        <p className="text-xs text-muted-foreground">
          Mes al que se suma este ingreso. Puede ser distinto de la fecha de
          recepción.
        </p>
      </div>
    </section>
  );
}
