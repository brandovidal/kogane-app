import { useState } from "react";
import { LoaderCircle, RotateCw } from "lucide-react";
import type { AttachmentRefType } from "@/shared/api/types";
import { useAttachments } from "../hooks/attachments";
import { AttachmentFileCard } from "./AttachmentFileCard";
import { AttachmentPreviewDialog } from "./dialogs/AttachmentPreviewDialog";
import { Button } from "@/ui/button";

export interface AttachmentGalleryProps {
  refType: AttachmentRefType;
  refId: string;
}

export function AttachmentGallery({ refType, refId }: AttachmentGalleryProps) {
  const query = useAttachments(refType, refId);
  const files = query.data ?? [];
  const [previewId, setPreviewId] = useState<string | null>(null);
  const index = files.findIndex((file) => file.id === previewId);
  if (query.isPending)
    return (
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Cargando archivos…
      </p>
    );
  if (query.isError)
    return (
      <div className="space-y-2">
        <p role="alert" className="text-sm text-muted-foreground">
          No se pudieron cargar los archivos.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={query.isFetching}
          onClick={() => query.refetch()}
        >
          <RotateCw aria-hidden="true" />
          Reintentar
        </Button>
      </div>
    );
  return (
    <div className="min-w-0 space-y-3">
      <p className="text-xs text-muted-foreground">
        {files.length
          ? `${files.length} archivos · Selecciona uno para previsualizarlo.`
          : "Sin archivos adjuntos."}
      </p>
      {files.length > 0 && (
        <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
          {files.map((file) => (
            <li key={file.id} className="min-w-0">
              <AttachmentFileCard
                file={file}
                onPreview={() => setPreviewId(file.id)}
              />
            </li>
          ))}
        </ul>
      )}
      {index >= 0 && (
        <AttachmentPreviewDialog
          files={files}
          initialIndex={index}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  );
}
