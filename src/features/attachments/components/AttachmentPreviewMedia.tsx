import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { getFileIcon } from "@/shared/lib/file-icons";
import { Button } from "@/ui/button";
import type { AttachmentPreview } from "../types/attachment-preview";

export function AttachmentPreviewMedia({ file, active = true }: { file: AttachmentPreview; active?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isImage = file.contentType.toLowerCase().startsWith("image/");
  const isPdf = file.contentType.toLowerCase().startsWith("application/pdf");
  const Icon = getFileIcon(file.contentType, file.name);

  return (
    <div className="flex h-[60vh] min-h-40 items-center justify-center overflow-auto rounded-lg bg-muted/20 p-2 sm:h-[65vh]">
      {file.url && isImage && !imageFailed ? (
        <img src={file.url} alt={file.name} className="max-h-full max-w-full rounded-md object-contain" onError={() => setImageFailed(true)} />
      ) : file.url && isPdf && active ? (
        <iframe src={file.url} title={`Vista previa de ${file.name}`} className="h-full w-full rounded-md border bg-background" />
      ) : file.url && isPdf ? (
        <Icon aria-hidden="true" className="size-8 text-muted-foreground" />
      ) : (
        <div className="space-y-3 px-4 text-center">
          <Icon aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
          <p className="max-w-md text-sm text-muted-foreground">
            {!file.url ? "No hay un enlace disponible para este archivo." : imageFailed ? "No se pudo cargar la imagen. Puedes abrir el archivo en otra pestaña." : "La vista previa integrada está disponible para imágenes y PDF. Puedes abrir este documento en otra pestaña."}
          </p>
          {file.url && (
            <Button asChild variant="outline" size="sm">
              <a href={file.url} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> Abrir archivo</a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
