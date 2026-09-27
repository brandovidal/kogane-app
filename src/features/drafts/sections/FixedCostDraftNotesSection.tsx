import { NotebookPen } from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import { Textarea } from "@/ui/textarea";
import type { DraftFormSectionProps } from "../types/draft-form";

export function FixedCostDraftNotesSection({ value, onChange }: DraftFormSectionProps) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <FormField label="Observaciones" icon={NotebookPen}>
        <Textarea aria-label="Observaciones del nuevo gasto" value={value.notes ?? ""} onChange={(event) => onChange({ ...value, notes: event.target.value })} placeholder="Escribe una nota…" />
      </FormField>
    </section>
  );
}
