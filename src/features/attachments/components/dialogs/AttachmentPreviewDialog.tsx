import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { getFileIcon } from "@/shared/lib/file-icons";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/ui/carousel";
import { ATTACHMENT_KIND_LABELS } from "../../constants/attachments";
import { formatAttachmentSize } from "../../lib/attachment-size";
import type { AttachmentPreviewDialogProps } from "../../types/attachment-preview";
import { AttachmentPreviewMedia } from "../AttachmentPreviewMedia";

export function AttachmentPreviewDialog({ files, initialIndex = 0, onClose }: AttachmentPreviewDialogProps) {
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

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={current.name}
      icon={<Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />}
      description={[ATTACHMENT_KIND_LABELS[current.kind] ?? current.kind, formatAttachmentSize(current.sizeBytes)].filter(Boolean).join(" · ")}
      contentClassName="sm:max-w-5xl max-h-[92vh]"
    >
      <Carousel setApi={setApi} opts={options} aria-label="Archivos del registro" className="min-w-0">
        <CarouselContent className="ml-0">
          {files.map((file, index) => (
            <CarouselItem key={file.id} className="pl-0" aria-label={`Archivo ${index + 1} de ${files.length}`} aria-hidden={index !== selected} inert={index !== selected}>
              {Math.abs(index - selected) <= 1 ? <AttachmentPreviewMedia key={`${file.id}:${file.url}`} file={file} active={index === selected} /> : <div className="h-[60vh] sm:h-[65vh]" />}
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-3 flex items-center justify-between gap-2">
          <CarouselPrevious size="sm" className="static rounded-md" aria-label="Archivo anterior">
            <ChevronLeft aria-hidden="true" className="size-4" /> Anterior
          </CarouselPrevious>
          <span role="status" aria-live="polite" aria-atomic="true" className="text-xs tabular-nums text-muted-foreground">{selected + 1} de {files.length}</span>
          <CarouselNext size="sm" className="static rounded-md" aria-label="Archivo siguiente">
            Siguiente <ChevronRight aria-hidden="true" className="size-4" />
          </CarouselNext>
        </div>
      </Carousel>
    </ResponsiveDialog>
  );
}
