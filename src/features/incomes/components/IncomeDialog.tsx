import { useId } from "react";
import { Banknote, LoaderCircle, Save, StickyNote } from "lucide-react";
import type { Income } from "../hooks/budget";
import { useIncomeForm } from "../hooks/useIncomeForm";
import { IncomeGeneralSection } from "../sections/IncomeGeneralSection";
import { IncomeScheduleSection } from "../sections/IncomeScheduleSection";
import type { MonthlyPeriod } from "@/shared/types/period";
import { FormField } from "@/shared/components/forms/FormField";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";

export interface IncomeDialogProps {
  income: Income | null;
  period: MonthlyPeriod;
  onClose: () => void;
  onSaved: (period: MonthlyPeriod) => void;
}

export function IncomeDialog({
  income,
  period,
  onClose,
  onSaved,
}: IncomeDialogProps) {
  const id = useId();
  const form = useIncomeForm(income, period, (savedPeriod) => {
    onSaved(savedPeriod);
    onClose();
  });
  const close = () => {
    if (!form.pending) onClose();
  };
  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && close()}
      title={income ? "Editar ingreso extra" : "Nuevo ingreso extra"}
      icon={<Banknote className="size-4 text-primary" aria-hidden="true" />}
      description="Registra bonos, trabajos extra o ventas para el mes elegido."
      contentClassName="sm:max-w-xl"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={form.pending}
          >
            Cancelar
          </Button>
          <Button type="submit" form={id} disabled={!form.canSave}>
            {form.pending ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <Save aria-hidden="true" />
            )}
            {form.pending ? "Guardando…" : "Guardar ingreso"}
          </Button>
        </>
      }
    >
      <form
        id={id}
        onSubmit={(event) => {
          event.preventDefault();
          form.save();
        }}
      >
        <fieldset disabled={form.pending} className="min-w-0 space-y-4">
          <IncomeGeneralSection form={form} />
          <IncomeScheduleSection form={form} />
          <FormField
            label="Nota"
            icon={StickyNote}
            htmlFor={`${id}-notes`}
            error={form.errorFor("notes")}
          >
            <Textarea
              id={`${id}-notes`}
              maxLength={500}
              rows={3}
              placeholder="Opcional"
              value={form.value.notes}
              onChange={(event) => form.update("notes", event.target.value)}
              onBlur={() => form.touch("notes")}
            />
          </FormField>
        </fieldset>
      </form>
    </ResponsiveDialog>
  );
}
