import { useRef, useState } from "react";
import { CloudUpload, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { ATTACHMENT_ACCEPT, ATTACHMENT_KIND_LABELS, ATTACHMENT_MAX_MB } from "@/features/attachments/constants/attachments";
import type { PendingAttachmentUpload } from "@/features/attachments/types/pending-attachment-upload";
import { Button } from "@/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { AttachmentFileCard } from "./AttachmentFileCard";

export function PendingAttachmentsPanel({
  files,
  onChange,
  onRetry,
  retrying = false,
  dropzone = false,
}: {
  files: PendingAttachmentUpload[];
  onChange: (files: PendingAttachmentUpload[]) => void;
  onRetry?: () => void;
  retrying?: boolean;
  dropzone?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<PendingAttachmentUpload["kind"]>("boleta");
  const [dragging, setDragging] = useState(false);

  const add = (file?: File) => {
    if (input.current) input.current.value = "";
    if (!file) return;
    if (file.size > ATTACHMENT_MAX_MB * 1024 * 1024) {
      toast.error(`El archivo debe pesar como máximo ${ATTACHMENT_MAX_MB} MB.`);
      return;
    }
    onChange([...files, { id: crypto.randomUUID(), file, kind }]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
          <SelectTrigger className="h-9 w-[130px]" aria-label="Tipo de archivo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ATTACHMENT_KIND_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!dropzone && (
          <Button type="button" size="sm" className="h-9" onClick={() => input.current?.click()}>
            <Paperclip className="mr-1.5 size-4" /> Adjuntar
          </Button>
        )}
        <input ref={input} type="file" accept={ATTACHMENT_ACCEPT} className="hidden" onChange={(event) => add(event.target.files?.[0])} />
        {!dropzone && <span className="text-xs text-muted-foreground">Imagen, PDF o documento de hasta {ATTACHMENT_MAX_MB} MB</span>}
      </div>
      {dropzone && (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            add(event.dataTransfer.files[0]);
          }}
          className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${dragging ? "border-brand bg-brand/5" : "border-border/80 bg-muted/15"}`}
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
            <CloudUpload aria-hidden="true" className="size-4" />
          </span>
          <div className="text-sm font-medium">
            Arrastra archivos o{" "}
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              selecciónalos
            </button>
          </div>
          <span className="text-xs text-muted-foreground">Imagen, PDF o documento · hasta {ATTACHMENT_MAX_MB} MB</span>
        </div>
      )}
      {files.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {files.map(({ id, file, kind: fileKind }) => (
            <li key={id} className="min-w-0">
              <AttachmentFileCard
                file={{ name: file.name, contentType: file.type || "application/octet-stream", sizeBytes: file.size, kind: fileKind, url: null }}
                onRemove={() => onChange(files.filter((item) => item.id !== id))}
                removeDisabled={retrying}
              />
            </li>
          ))}
        </ul>
      )}
      {onRetry && files.length > 0 && (
        <Button type="button" variant="outline" size="sm" disabled={retrying} onClick={onRetry}>
          {retrying ? "Subiendo…" : "Reintentar carga"}
        </Button>
      )}
    </div>
  );
}
