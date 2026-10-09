import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, CloudUpload, Paperclip } from "lucide-react";
import { toast } from "sonner";

import {
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from "@/features/attachments/hooks/attachments";
import type { Attachment, AttachmentRefType } from "@/shared/api/types";
import {
  ATTACHMENT_KIND_LABELS,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_MB,
} from "@/features/attachments/constants/attachments";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

import {
  attachmentsSummary,
  kindCounts,
} from "@/features/attachments/lib/attachment-view";
import { AttachmentFileCard } from "./AttachmentFileCard";
import { AttachmentFilterChips } from "./AttachmentFilterChips";
import { AttachmentKindChips } from "./AttachmentKindChips";
import { AttachmentPreviewDialog } from "./dialogs/AttachmentPreviewDialog";
import { OversizedAttachmentCard } from "./OversizedAttachmentCard";

export interface AttachmentsPanelProps {
  refType: AttachmentRefType;
  refId: string;
  defaultKind?: Attachment["kind"];
  kind?: Attachment["kind"];
  onKindChange?: (kind: Attachment["kind"]) => void;
  showKindSelect?: boolean;
  onUploaded?: (attachment: Attachment) => void;
  dropzone?: boolean;
  filterKind?: Attachment["kind"] | "all";
  listToolbar?: ReactNode;
  emptyMessage?: string | null;
  onInvalidFilesChange?: (count: number) => void;
}

interface UploadingAttachment {
  id: string;
  file: File;
  kind: Attachment["kind"];
}

// Boletas, recibos and contracts of a record, kept in R2 (D100). The links are signed and last a few minutes
export function AttachmentsPanel({
  refType,
  refId,
  defaultKind = "boleta",
  kind,
  onKindChange,
  showKindSelect = true,
  onUploaded,
  dropzone = false,
  filterKind,
  listToolbar,
  emptyMessage,
  onInvalidFilesChange,
}: AttachmentsPanelProps) {
  const {
    data: files = [],
    isLoading,
    isError,
  } = useAttachments(refType, refId);
  const upload = useUploadAttachment({ quiet: true });
  const remove = useDeleteAttachment();
  const [localKind, setLocalKind] = useState<Attachment["kind"]>(defaultKind);
  const selectedKind = kind ?? localKind;
  const changeKind = (next: Attachment["kind"]) => {
    onKindChange?.(next);
    if (kind === undefined) setLocalKind(next);
  };
  const [uploadingFiles, setUploadingFiles] = useState<UploadingAttachment[]>(
    [],
  );
  const [oversizedFiles, setOversizedFiles] = useState<UploadingAttachment[]>(
    [],
  );
  const [deletingFile, setDeletingFile] = useState<Attachment | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localFilter, setLocalFilter] = useState<string>("all");
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onInvalidFilesChange?.(oversizedFiles.length);
  }, [onInvalidFilesChange, oversizedFiles.length]);

  const uploadBatch = (batch: UploadingAttachment[]) => {
    if (!batch.length) return;
    setUploadingFiles((current) => [...current, ...batch]);
    void (async () => {
      let uploaded = 0;
      for (const queued of batch) {
        try {
          const attachment = await upload.mutateAsync({
            file: queued.file,
            refType,
            refId,
            kind: queued.kind,
          });
          uploaded += 1;
          onUploaded?.(attachment);
        } catch {
          toast.error(`No se pudo subir «${queued.file.name}».`);
        } finally {
          setUploadingFiles((current) =>
            current.filter((item) => item.id !== queued.id),
          );
        }
      }
      if (uploaded)
        toast.success(
          uploaded === 1
            ? "Archivo adjuntado"
            : `${uploaded} archivos adjuntados`,
        );
    })();
  };

  const pick = (selected: FileList | File[]) => {
    // Snapshot the live FileList before resetting the input. Otherwise clearing
    // input.value also clears the selected files before they are queued.
    const selectedFiles = Array.from(selected);
    if (input.current) input.current.value = "";
    const batch = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      kind: selectedKind,
    }));
    const limit = ATTACHMENT_MAX_MB * 1024 * 1024;
    setOversizedFiles((current) => [
      ...current,
      ...batch.filter((item) => item.file.size > limit),
    ]);
    uploadBatch(batch.filter((item) => item.file.size <= limit));
  };

  const replaceOversizedFile = (id: string, file: File) => {
    const kind =
      oversizedFiles.find((item) => item.id === id)?.kind ?? selectedKind;
    if (file.size > ATTACHMENT_MAX_MB * 1024 * 1024) {
      setOversizedFiles((current) =>
        current.map((item) => (item.id === id ? { ...item, file } : item)),
      );
      return;
    }
    setOversizedFiles((current) => current.filter((item) => item.id !== id));
    uploadBatch([{ id: crypto.randomUUID(), file, kind }]);
  };

  // Con `filterKind` el padre controla el filtro; sin él, los chips con conteo lo hacen aquí (board 14b)
  const activeFilter = filterKind ?? localFilter;
  const counts = kindCounts(files);
  const visibleFiles =
    activeFilter === "all"
      ? files
      : files.filter((file) => file.kind === activeFilter);
  const previewIndex = visibleFiles.findIndex((file) => file.id === previewId);

  return (
    <div className="space-y-3">
      <input
        ref={input}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={(event) => event.target.files && pick(event.target.files)}
      />
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => event.target.files && pick(event.target.files)}
      />
      {showKindSelect && dropzone && (
        <AttachmentKindChips
          value={selectedKind}
          onChange={changeKind}
          disabled={upload.isPending}
        />
      )}
      {!dropzone && (
        <div className="flex flex-wrap items-center gap-2">
          {showKindSelect && (
            <Select
              value={selectedKind}
              onValueChange={(value) => changeKind(value as Attachment["kind"])}
            >
              <SelectTrigger
                className="h-9 w-[130px]"
                aria-label="Tipo de archivo"
                disabled={upload.isPending}
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
              disabled={upload.isPending}
              onClick={() => input.current?.click()}
            >
              <Paperclip className="mr-1.5 h-4 w-4" />{" "}
              {upload.isPending ? "Subiendo…" : "Adjuntar"}
            </Button>
          )}
          {!dropzone && (
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
            pick(event.dataTransfer.files);
          }}
          onPaste={(event) => {
            const pastedFiles = event.clipboardData.files;
            if (pastedFiles.length) {
              event.preventDefault();
              pick(pastedFiles);
            }
          }}
          tabIndex={0}
          aria-label="Suelta o pega archivos aquí para adjuntarlos"
          className={`rounded-lg border border-dashed px-3 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${dragging ? "border-brand bg-brand/5" : "border-border/80 bg-muted/15"}`}
        >
          {!isLoading && files.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-2 py-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
                <Paperclip aria-hidden="true" className="size-5" />
              </span>
              <b className="text-sm">Aún no hay archivos adjuntos</b>
              <p className="max-w-xs text-xs text-muted-foreground">
                Sube la boleta, el recibo o el contrato para tener el respaldo
                de este registro.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={upload.isPending}
                  onClick={() => input.current?.click()}
                >
                  <CloudUpload className="size-4" /> Seleccionar archivos
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={upload.isPending}
                  onClick={() => camera.current?.click()}
                >
                  <Camera className="size-4" /> Tomar foto
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                o arrastra aquí · pega con ⌘V · hasta {ATTACHMENT_MAX_MB} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:text-left">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                <CloudUpload aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Arrastra, pega con ⌘V o{" "}
                  <button
                    type="button"
                    disabled={upload.isPending}
                    onClick={() => input.current?.click()}
                    className="text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    selecciónalos
                  </button>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Imagen, PDF o documento · hasta {ATTACHMENT_MAX_MB} MB
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 shrink-0 px-3"
                disabled={upload.isPending}
                onClick={() => input.current?.click()}
              >
                {upload.isPending ? "Subiendo…" : "Subir"}
              </Button>
            </div>
          )}
        </div>
      )}

      {uploadingFiles.map(({ id, file, kind }) => (
        <AttachmentFileCard
          key={id}
          uploading
          file={{
            name: file.name,
            contentType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            kind,
            url: null,
          }}
        />
      ))}
      {oversizedFiles.map(({ id, file, kind }) => (
        <OversizedAttachmentCard
          key={id}
          file={file}
          kind={kind}
          onReplace={(replacement) => replaceOversizedFile(id, replacement)}
          onRemove={() =>
            setOversizedFiles((current) =>
              current.filter((item) => item.id !== id),
            )
          }
        />
      ))}
      {listToolbar}
      {!isLoading && !isError && files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <b className="text-sm">Adjuntos</b>
            <span className="text-xs text-muted-foreground">
              {attachmentsSummary(files)}
            </span>
          </div>
          {filterKind === undefined && Object.keys(counts).length > 2 && (
            <AttachmentFilterChips
              counts={counts}
              value={activeFilter}
              onChange={setLocalFilter}
            />
          )}
        </div>
      )}
      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Cargando archivos…
        </p>
      ) : isError ? (
        <p role="alert" className="text-sm text-destructive">
          No se pudieron cargar los archivos.
        </p>
      ) : visibleFiles.length === 0 ? (
        files.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay archivos de este tipo.
          </p>
        ) : (
          // The dropzone shows its own empty state; without it keep the quiet message
          !dropzone && (
            <p className="text-sm text-muted-foreground">
              {emptyMessage ?? "Aún no hay archivos adjuntos."}
            </p>
          )
        )
      ) : (
        <ul className="grid w-full grid-cols-1 gap-2">
          {visibleFiles.map((file) => (
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
        description={
          <>
            Se eliminará permanentemente «{deletingFile?.name}». Esta acción no
            se puede deshacer.
          </>
        }
        pending={remove.isPending}
        onConfirm={() => {
          if (deletingFile) {
            remove.mutate(deletingFile.id, {
              onSuccess: () => setDeletingFile(null),
            });
          }
        }}
      />
      {previewIndex >= 0 && (
        <AttachmentPreviewDialog
          files={visibleFiles}
          initialIndex={previewIndex}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  );
}
