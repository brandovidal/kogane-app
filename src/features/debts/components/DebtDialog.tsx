import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { PersonSelect } from "@/shared/components/CatalogSelect";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useCreateDebt } from "@/shared/api/hooks/debts";
import { DEBT_DIRECTION_LABELS } from "@/shared/labels";
import { usePeriod } from "@/shared/stores/period.store";

const debtFormSchema = z.object({
  direction: z.enum(["owed_to_me", "i_owe"]),
  description: z.string().trim().min(1, "Descripción requerida"),
  amount: z.number({ error: "Monto requerido" }).positive("Monto debe ser positivo"),
  personId: z.string().min(1, "Persona requerida"),
  installments: z.number().int().min(1).max(120),
  dueDate: z.string(),
  notes: z.string().trim().transform((value) => value || null),
});
type DebtForm = z.input<typeof debtFormSchema>;
type DebtValues = z.output<typeof debtFormSchema>;

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: "owed_to_me" | "i_owe";
}

// One row per installment (D60): "3 cuotas de 400" creates three installments from the month on screen
export function DebtDialog({ open, onOpenChange, direction }: DebtDialogProps) {
  const createDebt = useCreateDebt();
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);

  const emptyForm: DebtForm = { direction, description: "", amount: 0, personId: "", installments: 1, dueDate: "", notes: "" };
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DebtForm, unknown, DebtValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: emptyForm,
  });

  useEffect(() => {
    if (open) reset(emptyForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, direction, reset]);

  const onSubmit = handleSubmit(({ dueDate, ...data }) => {
    createDebt.mutate(
      { ...data, dueDate: dueDate || null, paymentMonth: month, paymentYear: year },
      { onSuccess: () => onOpenChange(false) },
    );
  });

  const installments = watch("installments");

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={watch("direction") === "i_owe" ? "Nueva deuda (debo)" : "Nuevo préstamo (me deben)"}
      description="Si son cuotas, el monto es el de cada cuota"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={createDebt.isPending}>Crear</Button>
        </>
      }
    >
      <form className="space-y-4 py-2" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={watch("direction")} onValueChange={(v) => setValue("direction", v as DebtForm["direction"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DEBT_DIRECTION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Persona *</label>
            <PersonSelect value={watch("personId")} onChange={(id) => setValue("personId", id ?? "", { shouldValidate: true })} />
            {errors.personId && <p className="text-xs text-destructive">{errors.personId.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Descripción *</label>
          <Input {...register("description")} placeholder="Ej: Préstamo, Iphone 16..." />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{installments > 1 ? "Monto por cuota *" : "Monto *"}</label>
            <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cuotas</label>
            <Input type="number" min={1} max={120} {...register("installments", { valueAsNumber: true })} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Fecha límite</label>
          <Input type="date" {...register("dueDate")} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Comentario</label>
          <Input {...register("notes")} placeholder="Nota adicional..." />
        </div>
      </form>
    </ResponsiveDialog>
  );
}
