import { useId } from "react";
import { Banknote, LoaderCircle, Save } from "lucide-react";
import { useMonthlySalary } from "../../hooks/useMonthlySalary";
import { PeriodFields } from "@/shared/components/forms/PeriodFields";
import type { MonthlyPeriod } from "@/shared/types/period";
import { SalaryAmountSection } from "../../sections/SalaryAmountSection";
import { getMonthName } from "@/shared/lib/dates";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";

export interface SalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPeriod?: MonthlyPeriod;
  onSaved?: (period: MonthlyPeriod) => void;
}

// Mounted on opening: values and writes belong to the selected month.
export function SalaryDialog({
  open,
  onOpenChange,
  initialPeriod,
  onSaved,
}: SalaryDialogProps) {
  const formId = useId();
  const form = useMonthlySalary(
    open,
    (period) => {
      onSaved?.(period);
      onOpenChange(false);
    },
    initialPeriod,
  );
  const { month, year } = form.period;
  const saved = !!form.summary?.budget && !form.summary.budget.isProposal;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!form.saving) onOpenChange(next);
      }}
      title={`Sueldo de ${getMonthName(month)} ${year}`}
      icon={<Banknote aria-hidden="true" className="size-4 text-primary" />}
      description="Cada mes tiene su propio sueldo y límite de gasto. Guardar modifica únicamente el período seleccionado."
      contentClassName="sm:max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={form.saving}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={!form.canSave}>
            {form.saving ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <Save aria-hidden="true" />
            )}
            {form.saving ? "Guardando…" : "Guardar sueldo del mes"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          form.save();
        }}
      >
        <PeriodFields
          ariaLabel="Período del sueldo"
          value={form.period}
          onChange={form.setPeriod}
          disabled={form.saving}
        />
        {form.loading && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Cargando sueldo del mes…
          </p>
        )}
        {form.error && (
          <div role="alert" className="space-y-2 text-sm">
            <p>No se pudo cargar el sueldo de este mes.</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={form.retry}
            >
              Reintentar
            </Button>
          </div>
        )}
        {form.ready && (
          <div className="space-y-1 rounded-lg border bg-muted/20 p-3 text-sm">
            <Badge variant="outline">
              {saved
                ? "Registrado para este mes"
                : "Sin registrar para este mes"}
            </Badge>
            {form.summary?.budget?.isProposal && (
              <p className="text-xs text-muted-foreground">
                El monto es una sugerencia del último sueldo registrado.
                Guárdalo para confirmarlo en este mes.
              </p>
            )}
          </div>
        )}
        <SalaryAmountSection
          salary={form.salaryValue}
          limitPercent={form.percentValue}
          onSalaryChange={(value) => form.updateField("salary", value)}
          onPercentChange={(value) => form.updateField("limitPercent", value)}
          errors={form.errors}
          limit={form.ready ? form.limit : null}
          disabled={!form.ready || form.saving}
        />
      </form>
    </ResponsiveDialog>
  );
}
