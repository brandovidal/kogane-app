import { useState } from "react";
import {
  AlertCircle,
  FileDown,
  LoaderCircle,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { getFileIcon } from "@/shared/lib/file-icons";
import { Button } from "@/ui/button";
import type { AttachmentPreview } from "../types/attachment-preview";

export function AttachmentPreviewMedia({
  file,
  active = true,
}: {
  file: AttachmentPreview;
  active?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const isImage = file.contentType.toLowerCase().startsWith("image/");
  const isPdf = file.contentType.toLowerCase().startsWith("application/pdf");
  const Icon = getFileIcon(file.contentType, file.name);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setAttempt((value) => value + 1);
  };

  if (!file.url || (!isImage && !isPdf)) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="size-8" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <h3 className="font-semibold">
            No hay vista previa para este tipo de archivo
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Los archivos {file.name.split(".").pop()?.toLowerCase()} no se
            pueden mostrar aquí. Descárgalo para abrirlo en tu equipo.
          </p>
        </div>
        {file.url && (
          <Button asChild>
            <a href={file.url} download={file.name}>
              <FileDown aria-hidden="true" />
              Descargar ({formatBytes(file.sizeBytes)})
            </a>
          </Button>
        )}
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-8" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <h3 className="font-semibold">No pudimos cargar el archivo</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Revisa tu conexión e inténtalo de nuevo. Si el problema sigue,
            descárgalo directamente.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={retry}>
            <RotateCw aria-hidden="true" />
            Reintentar
          </Button>
          <Button asChild variant="outline">
            <a href={file.url} download={file.name}>
              <FileDown aria-hidden="true" />
              Descargar
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-64 items-center justify-center overflow-hidden">
      {loading && (
        <div
          role="status"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-muted-foreground"
        >
          <LoaderCircle
            className="size-8 animate-spin text-brand"
            aria-hidden="true"
          />
          <span className="text-sm">Cargando vista previa…</span>
        </div>
      )}
      {isImage ? (
        <img
          key={attempt}
          src={file.url}
          alt={file.name}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
          style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      ) : active ? (
        <iframe
          key={attempt}
          src={`${file.url}#toolbar=1&navpanes=0&view=FitH`}
          title={`Vista previa de ${file.name}`}
          className="h-full w-full bg-white"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      ) : null}
      {isImage && !loading && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/10 bg-neutral-900/90 p-1.5 shadow-lg backdrop-blur">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Alejar imagen"
            title="Alejar"
            disabled={scale <= 0.5}
            onClick={() => setScale((value) => Math.max(0.5, value - 0.25))}
          >
            <ZoomOut aria-hidden="true" />
          </Button>
          <span className="min-w-12 text-center text-xs tabular-nums text-white/70">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Acercar imagen"
            title="Acercar"
            disabled={scale >= 3}
            onClick={() => setScale((value) => Math.min(3, value + 0.25))}
          >
            <ZoomIn aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Rotar imagen"
            title="Rotar"
            onClick={() => setRotation((value) => (value + 90) % 360)}
          >
            <RotateCw aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Ajustar imagen"
            title="Ajustar"
            onClick={() => {
              setScale(1);
              setRotation(0);
            }}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}

function formatBytes(size: number | null) {
  if (size == null || size <= 0) return "tamaño desconocido";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
