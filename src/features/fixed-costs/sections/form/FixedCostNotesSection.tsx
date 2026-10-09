import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Check, NotebookPen, Paperclip } from "lucide-react";
import { AttachmentsPanel } from "@/features/attachments/components/AttachmentsPanel";
import { PendingAttachmentsPanel } from "@/features/attachments/components/PendingAttachmentsPanel";
import { ATTACHMENT_KIND_LABELS } from "@/features/attachments/constants/attachments";
import type { PendingAttachmentUpload } from "@/features/attachments/types/pending-attachment-upload";
import { useAttachments } from "@/features/attachments/hooks/attachments";
import type { Attachment } from "@/shared/api/types";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { Textarea } from "@/ui/textarea";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
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
  uploadingAttachmentIds,
  onInvalidSavedUploadsChange,
}: {
  fixedCostId?: string;
  pendingAttachments: PendingAttachmentUpload[];
  onPendingAttachmentsChange: (files: PendingAttachmentUpload[]) => void;
  onRetryPendingAttachments: () => void;
  retryingAttachments: boolean;
  uploadingAttachmentIds: ReadonlySet<string>;
  onInvalidSavedUploadsChange: (count: number) => void;
}) {
  const [attachmentKind, setAttachmentKind] =
    useState<Attachment["kind"]>("boleta");
  const [filterKind, setFilterKind] = useState<Attachment["kind"] | "all">(
    "all",
  );
  const savedAttachments = useAttachments("fixed_cost", fixedCostId ?? "", {
    enabled: !!fixedCostId,
  });
  const savedFiles = savedAttachments.data ?? [];
  const attachmentKinds = Object.keys(
    ATTACHMENT_KIND_LABELS,
  ) as Attachment["kind"][];
  const totalFiles = savedFiles.length + pendingAttachments.length;
  const countForKind = (kind: Attachment["kind"] | "all") =>
    kind === "all"
      ? totalFiles
      : savedFiles.filter((file) => file.kind === kind).length +
        pendingAttachments.filter((file) => file.kind === kind).length;
  const filterToolbar =
    totalFiles > 0 ? (
      <div
        className="flex flex-wrap items-center gap-1 border-t border-border/70 pt-3"
        aria-label="Filtrar archivos por tipo"
      >
        {(["all", ...attachmentKinds] as const).map((kind) => {
          const count = countForKind(kind);
          if (kind !== "all" && count === 0) return null;
          const selected = filterKind === kind;
          return (
            <Button
              key={kind}
              type="button"
              size="sm"
              variant={selected ? "secondary" : "ghost"}
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={() => setFilterKind(kind)}
              aria-pressed={selected}
            >
              {kind === "all" ? "Todos" : ATTACHMENT_KIND_LABELS[kind]}
              <span className="text-muted-foreground">{count}</span>
            </Button>
          );
        })}
      </div>
    ) : null;
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
      <section className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">
              <FieldLabel icon={Paperclip}>Archivos</FieldLabel>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Respaldo del gasto: boletas, recibos y contratos.
            </p>
          </div>
          {totalFiles > 0 && (
            <Badge variant="secondary" className="shrink-0">
              {totalFiles} {totalFiles === 1 ? "archivo" : "archivos"}
            </Badge>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Tipo de archivo</p>
          <div className="flex flex-wrap gap-1.5">
            {attachmentKinds.map((kind) => (
              <Button
                key={kind}
                type="button"
                size="sm"
                variant={attachmentKind === kind ? "secondary" : "outline"}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={() => setAttachmentKind(kind)}
                aria-pressed={attachmentKind === kind}
              >
                {attachmentKind === kind && (
                  <Check aria-hidden="true" className="size-3.5" />
                )}
                {ATTACHMENT_KIND_LABELS[kind]}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {fixedCostId
              ? "El tipo se aplica a los archivos que subas ahora."
              : "El tipo se aplica a los archivos nuevos; se adjuntarán al crear el gasto."}
          </p>
        </div>
        {fixedCostId ? (
          <AttachmentsPanel
            refType="fixed_cost"
            refId={fixedCostId}
            kind={attachmentKind}
            onKindChange={setAttachmentKind}
            showKindSelect={false}
            filterKind={filterKind}
            listToolbar={filterToolbar}
            emptyMessage={
              savedFiles.length > 0 ? "Sin archivos todavía." : null
            }
            onUploaded={(attachment) => {
              // Keep the open editor in sync with the automatic server transition after a boleta.
              if (
                attachment.kind === "boleta" &&
                getValues("paymentStatus") === "not_started"
              )
                setValue("paymentStatus", "paid", { shouldDirty: true });
            }}
            onInvalidFilesChange={onInvalidSavedUploadsChange}
            dropzone
          />
        ) : null}
        <PendingAttachmentsPanel
          files={pendingAttachments}
          onChange={onPendingAttachmentsChange}
          onRetry={fixedCostId ? onRetryPendingAttachments : undefined}
          retrying={retryingAttachments}
          uploadingIds={uploadingAttachmentIds}
          kind={attachmentKind}
          onKindChange={setAttachmentKind}
          showKindSelect={false}
          dropzone={!fixedCostId}
          filterKind={filterKind}
          listToolbar={!fixedCostId ? filterToolbar : undefined}
        />
      </section>
    </div>
  );
}
