import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, Paperclip, Trash2 } from "lucide-react";

import { useAttachments, useDeleteAttachment, useUploadAttachment } from "@/shared/api/hooks/commitments";
import type { Attachment, AttachmentRefType } from "@/shared/api/types";
import { ATTACHMENT_KIND_LABELS } from "@/shared/labels";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { ResponsiveDialog } from "./ResponsiveDialog";

const ACCEPT = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt";
const MAX_MB = 15;

const sizeOf = (bytes: number | null) => {
  if (bytes == null) return "";
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

interface AttachmentsPanelProps {
  refType: AttachmentRefType;
  refId: string;
  defaultKind?: Attachment["kind"];
}

// Boletas, recibos and contracts of a record, kept in R2 (D100). The links are signed and last a few minutes
export function AttachmentsPanel({ refType, refId, defaultKind = "boleta" }: AttachmentsPanelProps) {
  const { data: files = [], isLoading } = useAttachments(refType, refId);
  const upload = useUploadAttachment();
  const remove = useDeleteAttachment();
  const [kind, setKind] = useState<Attachment["kind"]>(defaultKind);
  const input = useRef<HTMLInputElement>(null);

  const pick = (file: File | undefined) => {
    if (input.current) input.current.value = "";
    if (file) upload.mutate({ file, refType, refId, kind });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={kind} onValueChange={(value) => setKind(value as Attachment["kind"])}>
          <SelectTrigger className="h-9 w-[130px]" aria-label="Tipo de archivo">
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
        <Button size="sm" className="h-9" disabled={upload.isPending} onClick={() => input.current?.click()}>
          <Paperclip className="mr-1.5 h-4 w-4" /> {upload.isPending ? "Subiendo…" : "Adjuntar"}
        </Button>
        <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(event) => pick(event.target.files?.[0])} />
        <span className="text-xs text-muted-foreground">Imagen, PDF o documento de hasta {MAX_MB} MB</span>
      </div>

      {isLoading ? null : files.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin archivos todavía.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {files.map((file) => {
            const Icon = file.contentType.startsWith("image/") ? ImageIcon : FileText;
            return (
              <li key={file.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Badge variant="outline">{ATTACHMENT_KIND_LABELS[file.kind] ?? file.kind}</Badge>
                {file.url ? (
                  <a href={file.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-medium underline-offset-2 hover:underline">
                    {file.name}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 truncate" title="El almacenamiento no genera enlaces en este entorno">
                    {file.name}
                  </span>
                )}
                <span className="shrink-0 text-xs text-muted-foreground">{sizeOf(file.sizeBytes)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  aria-label={`Eliminar ${file.name}`}
                  disabled={remove.isPending}
                  onClick={() => window.confirm(`¿Eliminar «${file.name}»? No se puede deshacer.`) && remove.mutate(file.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// The same panel in a dialog, for the ⋯ of an expense row
export function AttachmentsDialog({
  title,
  refType,
  refId,
  onClose,
}: {
  title: string;
  refType: AttachmentRefType;
  refId: string;
  onClose: () => void;
}) {
  return (
    <ResponsiveDialog open onOpenChange={(open) => !open && onClose()} title={`Archivos de ${title}`} description="Boleta, recibo o contrato de este registro.">
      <AttachmentsPanel refType={refType} refId={refId} />
    </ResponsiveDialog>
  );
}
