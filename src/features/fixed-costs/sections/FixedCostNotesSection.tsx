import { useFormContext } from "react-hook-form";
import { NotebookPen, Paperclip } from "lucide-react";
import { AttachmentsPanel } from "@/features/attachments/components/AttachmentsPanel";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { Textarea } from "@/ui/textarea";
import type { FixedCostForm, FixedCostValues } from "@/features/fixed-costs/lib/fixed-cost-form";

export function FixedCostNotesSection({ fixedCostId }: { fixedCostId?: string }) {
  const { register } = useFormContext<FixedCostForm, unknown, FixedCostValues>();

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-lg border p-4">
        <div>
          <h3 className="text-sm font-semibold"><FieldLabel icon={NotebookPen}>Observaciones</FieldLabel></h3>
          <p className="mt-1 text-xs text-muted-foreground">Agrega información útil para identificar o explicar este registro.</p>
        </div>
        <Textarea aria-label="Observaciones del costo fijo" {...register("notes")} placeholder="Escribe una nota…" />
      </section>
      {fixedCostId && (
        <section className="space-y-3 rounded-lg border p-4">
          <h3 className="text-sm font-semibold"><FieldLabel icon={Paperclip}>Archivos</FieldLabel></h3>
          <AttachmentsPanel refType="fixed_cost" refId={fixedCostId} />
        </section>
      )}
    </div>
  );
}
