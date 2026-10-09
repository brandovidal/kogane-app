import { useRef, useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import type { Attachment } from "@/shared/api/types";
import { toast } from "sonner";
import { Button } from "@/ui/button";
import { getFileIcon } from "@/shared/lib/file-icons";
import { formatAttachmentSize } from "../lib/attachment-size";
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_MB } from "../constants/attachments";
import { compressImage } from "../lib/compress-image";

export function OversizedAttachmentCard({
  file,
  kind,
  onReplace,
  onRemove,
}: {
  file: File;
  kind: Attachment["kind"];
  onReplace: (file: File) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const Icon = getFileIcon(file.type || "application/octet-stream", file.name);
  const canCompress =
    file.type.startsWith("image/") &&
    file.type !== "image/gif" &&
    file.type !== "image/svg+xml";

  const compress = async () => {
    if (!canCompress) {
      toast.info(
        "Reduce el tamaño del archivo con la opción de exportar o guardar una copia comprimida, y selecciónala aquí.",
      );
      input.current?.click();
      return;
    }
    setCompressing(true);
    try {
      onReplace(await compressImage(file));
    } catch {
      toast.info(
        "No se pudo comprimir automáticamente. Elige una versión reducida del archivo.",
      );
      input.current?.click();
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-destructive/70 bg-destructive/5 p-2.5">
      <input
        ref={input}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const replacement = event.target.files?.[0];
          if (replacement) onReplace(replacement);
          event.target.value = "";
        }}
      />
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-destructive">
          {formatAttachmentSize(file.size)} supera el límite de{" "}
          {ATTACHMENT_MAX_MB} MB
        </p>
        {!canCompress && (
          <p className="text-xs text-muted-foreground">
            Reduce el tamaño del archivo y selecciona la versión comprimida.
          </p>
        )}
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 shrink-0"
        disabled={compressing}
        onClick={() => void compress()}
      >
        {compressing ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {compressing
          ? "Comprimiendo…"
          : canCompress
            ? "Comprimir"
            : "Elegir reducido"}
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="shrink-0 text-destructive hover:text-destructive"
        aria-label={`Quitar ${file.name}`}
        onClick={onRemove}
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </Button>
      <span className="sr-only">Tipo: {kind}</span>
    </div>
  );
}
