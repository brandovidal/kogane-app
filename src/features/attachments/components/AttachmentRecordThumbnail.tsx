import { useState } from "react";
import { Paperclip } from "lucide-react";
import type { AttachmentRefType } from "@/shared/api/types";
import { getFileIcon } from "@/shared/lib/file-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { useAttachmentThumbnail } from "../hooks/useAttachmentThumbnail";
import { AttachmentPreviewDialog } from "./dialogs/AttachmentPreviewDialog";
import { ATTACHMENT_KIND_LABELS } from "../constants/attachments";

export interface AttachmentRecordThumbnailProps {
  refType: AttachmentRefType;
  refId: string;
  label: string;
  showPlaceholder?: boolean;
  variant?: "thumbnail" | "cover";
}

export function AttachmentRecordThumbnail({ refType, refId, label, showPlaceholder = false, variant = "thumbnail" }: AttachmentRecordThumbnailProps) {
  const { ref, visible, data: files = [], isLoading } = useAttachmentThumbnail(refType, refId);
  const [open, setOpen] = useState(false);
  const first = files[0];
  const Icon = first ? getFileIcon(first.contentType, first.name) : Paperclip;
  const isImage = first?.contentType.toLowerCase().startsWith("image/");
  const cover = variant === "cover";

  return (
    <div ref={ref} className={visible && !isLoading && !first && !showPlaceholder ? "hidden" : cover ? "relative block h-28 w-full overflow-hidden bg-muted/40" : "shrink-0"}>
      {first ? (
        <button
          type="button"
          aria-label={`Ver archivos de ${label}`}
          title={`${first.name} · ${files.length} ${files.length === 1 ? "archivo" : "archivos"}`}
          className={cover ? "absolute inset-0 block h-full w-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" : "rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"}
          onClick={() => setOpen(true)}
        >
          <Avatar key={`${first.id}:${first.url}`} className={cover ? "h-full w-full rounded-none after:rounded-none" : "size-9 overflow-hidden rounded-lg after:rounded-lg"}>
            {isImage && first.url && <AvatarImage src={first.url} alt="" loading="lazy" className={cover ? "rounded-none object-cover" : "rounded-lg"} />}
            <AvatarFallback className={cover ? "rounded-none" : "rounded-lg"}><Icon aria-hidden="true" className={cover ? "size-7" : "size-4"} /></AvatarFallback>
          </Avatar>
        </button>
      ) : !visible || isLoading ? (
        <div aria-hidden="true" className={cover ? "absolute inset-0 animate-pulse bg-muted/40" : "size-9 animate-pulse rounded-lg bg-muted/40"} />
      ) : showPlaceholder ? (
        <div aria-hidden="true" className={cover ? "fixed-costs-thumbnail-placeholder absolute inset-0 rounded-none" : "fixed-costs-thumbnail-placeholder size-9 rounded-lg"} />
      ) : null}
      {cover && first && (
        <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
          <Paperclip className="size-3" /> {files.length} · {ATTACHMENT_KIND_LABELS[first.kind] ?? "Archivo"}
        </span>
      )}
      {open && files.length > 0 && <AttachmentPreviewDialog files={files} onClose={() => setOpen(false)} />}
    </div>
  );
}
