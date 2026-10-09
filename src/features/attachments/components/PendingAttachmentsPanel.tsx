import { useRef, useState, type ReactNode } from "react";
import { CloudUpload, Paperclip } from "lucide-react";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_KIND_LABELS,
  ATTACHMENT_MAX_MB,
} from "@/features/attachments/constants/attachments";
import type { PendingAttachmentUpload } from "@/features/attachments/types/pending-attachment-upload";
import type { Attachment } from "@/shared/api/types";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { AttachmentFileCard } from "./AttachmentFileCard";
import { OversizedAttachmentCard } from "./OversizedAttachmentCard";

export function PendingAttachmentsPanel({
  files,
  onChange,
  onRetry,
  retrying = false,
  dropzone = false,
  kind,
  onKindChange,
  showKindSelect = true,
  filterKind = "all",
  listToolbar,
  uploadingIds,
}: {
  files: PendingAttachmentUpload[];
  onChange: (files: PendingAttachmentUpload[]) => void;
  onRetry?: () => void;
  retrying?: boolean;
  dropzone?: boolean;
  kind?: Attachment["kind"];
  onKindChange?: (kind: Attachment["kind"]) => void;
  showKindSelect?: boolean;
  filterKind?: Attachment["kind"] | "all";
  listToolbar?: ReactNode;
  uploadingIds?: ReadonlySet<string>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [localKind, setLocalKind] =
    useState<PendingAttachmentUpload["kind"]>("boleta");
  const selectedKind = kind ?? localKind;
  const changeKind = (next: PendingAttachmentUpload["kind"]) => {
    onKindChange?.(next);
    if (kind === undefined) setLocalKind(next);
  };
  const [dragging, setDragging] = useState(false);

  const add = (selected: FileList | File[]) => {
    // FileList is live and tied to the input; snapshot it before clearing the
    // input so the same file can be selected again later.
    const selectedFiles = Array.from(selected);
    if (input.current) input.current.value = "";
    if (selectedFiles.length) {
      onChange([
        ...files,
        ...selectedFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          kind: selectedKind,
        })),
      ]);
    }
  };
  const visibleFiles =
    filterKind === "all"
      ? files
      : files.filter((file) => file.kind === filterKind);

  return (
    <div className="space-y-3">
      {(showKindSelect || dropzone) && (
        <div className="flex flex-wrap items-center gap-2">
          {showKindSelect && (
            <Select
              value={selectedKind}
              onValueChange={(value) =>
                changeKind(value as PendingAttachmentUpload["kind"])
              }
            >
              <SelectTrigger
                className="h-9 w-[130px]"
                aria-label="Tipo de archivo"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ATTACHMENT_KIND_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )}
          {!dropzone && (
            <Button
              type="button"
              size="sm"
              className="h-9"
              onClick={() => input.current?.click()}
            >
              <Paperclip className="mr-1.5 size-4" /> Adjuntar
            </Button>
          )}
          <input
            ref={input}
            type="file"
            multiple
            accept={ATTACHMENT_ACCEPT}
            className="hidden"
            onChange={(event) => event.target.files && add(event.target.files)}
          />
          {!dropzone && showKindSelect && (
            <span className="text-xs text-muted-foreground">
              Imagen, PDF o documento de hasta {ATTACHMENT_MAX_MB} MB
            </span>
          )}
        </div>
      )}
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
            add(event.dataTransfer.files);
          }}
          onPaste={(event) => {
            const pastedFiles = event.clipboardData.files;
            if (pastedFiles.length) {
              event.preventDefault();
              add(pastedFiles);
            }
          }}
          tabIndex={0}
          aria-label="Suelta o pega archivos aquí para adjuntarlos"
          className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-3 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:text-left ${dragging ? "border-brand bg-brand/5" : "border-border/80 bg-muted/15"}`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
            <CloudUpload aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              Arrastra, pega con ⌘V o{" "}
              <button
                type="button"
                disabled={retrying}
                onClick={() => input.current?.click()}
                className="text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                selecciónalos
              </button>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Imágenes y documentos · hasta {ATTACHMENT_MAX_MB} MB cada uno
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 shrink-0 px-3"
            disabled={retrying}
            onClick={() => input.current?.click()}
          >
            Subir
          </Button>
        </div>
      )}
      {listToolbar}
      {visibleFiles.length > 0 && (
        <ul className="grid w-full grid-cols-1 gap-2">
          {visibleFiles.map(({ id, file, kind: fileKind }) => (
            <li key={id} className="min-w-0">
              {file.size > ATTACHMENT_MAX_MB * 1024 * 1024 ? (
                <OversizedAttachmentCard
                  file={file}
                  kind={fileKind}
                  onReplace={(replacement) =>
                    onChange(
                      files.map((item) =>
                        item.id === id ? { ...item, file: replacement } : item,
                      ),
                    )
                  }
                  onRemove={() =>
                    onChange(files.filter((item) => item.id !== id))
                  }
                />
              ) : (
                <AttachmentFileCard
                  uploading={uploadingIds?.has(id)}
                  file={{
                    name: file.name,
                    contentType: file.type || "application/octet-stream",
                    sizeBytes: file.size,
                    kind: fileKind,
                    url: null,
                  }}
                  onRemove={() =>
                    onChange(files.filter((item) => item.id !== id))
                  }
                  removeDisabled={retrying}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 &&
        visibleFiles.length === 0 &&
        filterKind !== "all" && (
          <p className="text-sm text-muted-foreground">
            No hay archivos pendientes de este tipo.
          </p>
        )}
      {onRetry && files.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={retrying}
          onClick={onRetry}
        >
          {retrying ? "Subiendo…" : "Reintentar carga"}
        </Button>
      )}
    </div>
  );
}
