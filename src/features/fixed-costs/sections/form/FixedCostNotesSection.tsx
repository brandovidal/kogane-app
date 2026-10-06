import { useFormContext } from "react-hook-form";
import { NotebookPen, Paperclip } from "lucide-react";
import { AttachmentsPanel } from "@/features/attachments/components/AttachmentsPanel";
import { PendingAttachmentsPanel } from "@/features/attachments/components/PendingAttachmentsPanel";
import type { PendingAttachmentUpload } from "@/features/attachments/types/pending-attachment-upload";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { Textarea } from "@/ui/textarea";
import type {
  FixedCostForm,
  FixedCostValues,
} from "@/features/fixed-costs/lib/fixed-cost-form";

export function FixedCostNotesSection({
  fixedCostId,
  pendingAttachments,
  onPendingAttachmentsChange,
  onRetryPendingAttachments,
  retryingAttachments,
}: {
  fixedCostId?: string;
  pendingAttachments: PendingAttachmentUpload[];
  onPendingAttachmentsChange: (files: PendingAttachmentUpload[]) => void;
  onRetryPendingAttachments: () => void;
  retryingAttachments: boolean;
}) {
  const { register, getValues, setValue } = useFormContext<
    FixedCostForm,
    unknown,
    FixedCostValues
  >();

  return (
    <div className="space-y-3">
      <section className="space-y-4 rounded-xl border border-border/80 bg-card/40 p-4 sm:p-5">
        <div>
          <h3 className="text-sm font-semibold">
            <FieldLabel icon={NotebookPen}>Observaciones</FieldLabel>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Agrega información útil para identificar o explicar este registro.
          </p>
        </div>
        <Textarea
          aria-label="Observaciones del costo fijo"
          className="min-h-24 resize-y bg-background/50"
          {...register("notes")}
          placeholder="Escribe una nota…"
        />
      </section>
      <section className="space-y-4 rounded-xl border border-border/80 bg-card/40 p-4 sm:p-5">
        <h3 className="text-sm font-semibold">
          <FieldLabel icon={Paperclip}>Archivos</FieldLabel>
        </h3>
        {fixedCostId ? (
          <AttachmentsPanel
            refType="fixed_cost"
            refId={fixedCostId}
            onUploaded={(attachment) => {
              // Keep the open editor in sync with the automatic server transition after a boleta.
              if (
                attachment.kind === "boleta" &&
                getValues("paymentStatus") === "not_started"
              )
                setValue("paymentStatus", "paid", { shouldDirty: true });
            }}
            dropzone
          />
        ) : (
          <p className="text-xs text-muted-foreground">Los archivos se adjuntarán al crear el costo fijo.</p>
        )}
        <PendingAttachmentsPanel
          files={pendingAttachments}
          onChange={onPendingAttachmentsChange}
          onRetry={fixedCostId ? onRetryPendingAttachments : undefined}
          retrying={retryingAttachments}
          dropzone
        />
      </section>
    </div>
  );
}
