import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/ui/dialog";
import { getFileIcon } from "@/shared/lib/file-icons";
import { ATTACHMENT_KIND_LABELS } from "../../constants/attachments";
import { formatAttachmentSize } from "../../lib/attachment-size";
import type { AttachmentPreviewDialogProps } from "../../types/attachment-preview";
import { AttachmentPreviewMedia } from "../AttachmentPreviewMedia";

export function AttachmentPreviewDialog({
  files,
  initialIndex = 0,
  onClose,
}: AttachmentPreviewDialogProps) {
  const startIndex = Math.max(0, Math.min(initialIndex, files.length - 1));
  const [selected, setSelected] = useState(startIndex);
  const [api, setApi] = useState<CarouselApi>();
  const options = useMemo(() => ({ startIndex, loop: false }), [startIndex]);

  useEffect(() => {
    if (!api) return;
    const syncSelection = () => setSelected(api.selectedScrollSnap());
    syncSelection();
    api.on("select", syncSelection);
    api.on("reInit", syncSelection);
    return () => {
      api.off("select", syncSelection);
      api.off("reInit", syncSelection);
    };
  }, [api]);

  const current = files[selected] ?? files[0];
  if (!current) return null;
  const Icon = getFileIcon(current.contentType, current.name);
  const uploaded = new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(current.createdAt));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(94dvh,1000px)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-4 overflow-hidden border-border/80 bg-background p-4 sm:w-[calc(100vw-2rem)] sm:max-w-[1280px] sm:gap-5 sm:p-6"
      >
        <header className="flex min-w-0 shrink-0 items-start gap-3">
          <Icon
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-primary"
          />
          <div className="min-w-0 flex-1">
            <DialogTitle
              className="truncate text-base font-semibold sm:text-lg"
              title={current.name}
            >
              {current.name}
            </DialogTitle>
            <DialogDescription className="mt-1 truncate text-sm text-muted-foreground">
              {ATTACHMENT_KIND_LABELS[current.kind] ?? current.kind} ·{" "}
              {formatAttachmentSize(current.sizeBytes)} · subido el {uploaded}
            </DialogDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {current.url && (
              <Button
                asChild
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Descargar ${current.name}`}
                title="Descargar"
              >
                <a href={current.url} download={current.name}>
                  <Download aria-hidden="true" />
                </a>
              </Button>
            )}
            {current.url && (
              <Button
                asChild
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Abrir ${current.name} en otra pestaña`}
                title="Abrir en otra pestaña"
              >
                <a href={current.url} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            )}
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Cerrar vista previa"
              >
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>
        </header>

        <Carousel
          setApi={setApi}
          opts={options}
          aria-label="Vista previa de archivos adjuntos"
          className="flex min-h-0 flex-1 flex-col"
        >
          <CarouselContent
            viewportClassName="min-h-0 flex-1 rounded-2xl bg-muted/20"
            className="ml-0 h-full"
          >
            {files.map((file, index) => (
              <CarouselItem
                key={file.id}
                className="h-full min-h-0 pl-0"
                aria-label={`Archivo ${index + 1} de ${files.length}`}
                aria-hidden={index !== selected}
                inert={index !== selected}
              >
                {Math.abs(index - selected) <= 1 ? (
                  <AttachmentPreviewMedia
                    key={`${file.id}:${file.url}`}
                    file={file}
                    active={index === selected}
                  />
                ) : null}
              </CarouselItem>
            ))}
          </CarouselContent>
          <footer className="mt-3 flex shrink-0 items-center justify-between gap-3">
            <CarouselPrevious
              size="sm"
              variant="outline"
              className="static inset-auto left-auto right-auto my-0 translate-y-0 rounded-lg"
              aria-label="Archivo anterior"
            >
              <ChevronLeft aria-hidden="true" />
              Anterior
            </CarouselPrevious>
            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="text-sm tabular-nums text-muted-foreground"
            >
              {selected + 1} de {files.length}
            </span>
            <CarouselNext
              size="sm"
              variant="outline"
              className="static inset-auto left-auto right-auto my-0 translate-y-0 rounded-lg"
              aria-label="Archivo siguiente"
            >
              Siguiente
              <ChevronRight aria-hidden="true" />
            </CarouselNext>
          </footer>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
