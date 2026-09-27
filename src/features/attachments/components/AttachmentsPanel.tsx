import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";

import { useAttachments, useDeleteAttachment, useUploadAttachment } from "@/features/attachments/hooks/attachments";
import type { Attachment, AttachmentRefType } from "@/shared/api/types";
import { ATTACHMENT_KIND_LABELS, ATTACHMENT_ACCEPT, ATTACHMENT_MAX_MB } from "@/features/attachments/constants/attachments";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Button } from "@/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { AttachmentFileCard } from "./AttachmentFileCard";
import { AttachmentPreviewDialog } from "./dialogs/AttachmentPreviewDialog";

export interface AttachmentsPanelProps {
  refType: AttachmentRefType;
  refId: string;
  defaultKind?: Attachment["kind"];
}

// Boletas, recibos and contracts of a record, kept in R2 (D100). The links are signed and last a few minutes
export function AttachmentsPanel({ refType, refId, defaultKind = "boleta" }: AttachmentsPanelProps) {
  const { data: files = [], isLoading, isError } = useAttachments(refType, refId);
  const upload = useUploadAttachment();
  const remove = useDeleteAttachment();
  const [kind, setKind] = useState<Attachment["kind"]>(defaultKind);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [deletingFile, setDeletingFile] = useState<Attachment | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewIndex = files.findIndex((file) => file.id === previewId);
  const input = useRef<HTMLInputElement>(null);

  const pick = (file: File | undefined) => {
    if (input.current) input.current.value = "";
    if (!file) return;
    if (file.size > ATTACHMENT_MAX_MB * 1024 * 1024) {
      toast.error(`El archivo debe pesar como máximo ${ATTACHMENT_MAX_MB} MB.`);
      return;
    }
    setUploadingFile(file);
    upload.mutate({ file, refType, refId, kind }, { onSettled: () => setUploadingFile(null) });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={kind} onValueChange={(value) => setKind(value as Attachment["kind"])}>
          <SelectTrigger className="h-9 w-[130px]" aria-label="Tipo de archivo" disabled={upload.isPending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ATTACHMENT_KIND_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" size="sm" className="h-9" disabled={upload.isPending} onClick={() => input.current?.click()}>
          <Paperclip className="mr-1.5 h-4 w-4" /> {upload.isPending ? "Subiendo…" : "Adjuntar"}
        </Button>
        <input ref={input} type="file" accept={ATTACHMENT_ACCEPT} className="hidden" onChange={(event) => pick(event.target.files?.[0])} />
        <span className="text-xs text-muted-foreground">Imagen, PDF o documento de hasta {ATTACHMENT_MAX_MB} MB</span>
      </div>

      {uploadingFile && (
        <AttachmentFileCard uploading file={{ name: uploadingFile.name, contentType: uploadingFile.type, sizeBytes: uploadingFile.size, kind, url: null }} />
      )}
      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">Cargando archivos…</p>
      ) : isError ? (
        <p role="alert" className="text-sm text-destructive">No se pudieron cargar los archivos.</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin archivos todavía.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {files.map((file) => (
            <li key={file.id} className="min-w-0">
              <AttachmentFileCard
                file={file}
                removeDisabled={remove.isPending}
                onRemove={() => setDeletingFile(file)}
                onPreview={() => setPreviewId(file.id)}
              />
            </li>
          ))}
        </ul>
      )}
      <DeleteConfirmationDialog
        open={deletingFile !== null}
        onOpenChange={(open) => !open && setDeletingFile(null)}
        title="¿Eliminar archivo?"
        description={<>Se eliminará permanentemente «{deletingFile?.name}». Esta acción no se puede deshacer.</>}
        pending={remove.isPending}
        onConfirm={() => {
          if (deletingFile) {
            remove.mutate(deletingFile.id, { onSuccess: () => setDeletingFile(null) });
          }
        }}
      />
      {previewIndex >= 0 && (
        <AttachmentPreviewDialog files={files} initialIndex={previewIndex} onClose={() => setPreviewId(null)} />
      )}
    </div>
  );
}
