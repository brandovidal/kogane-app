import { useState } from "react";
import { Paperclip } from "lucide-react";
import type { AttachmentRefType } from "@/shared/api/types";
import { getFileIcon } from "@/shared/lib/file-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { useAttachmentThumbnail } from "../hooks/useAttachmentThumbnail";
import { AttachmentPreviewDialog } from "./dialogs/AttachmentPreviewDialog";

export interface AttachmentRecordThumbnailProps {
  refType: AttachmentRefType;
  refId: string;
  label: string;
}

export function AttachmentRecordThumbnail({ refType, refId, label }: AttachmentRecordThumbnailProps) {
  const { ref, visible, data: files = [], isLoading } = useAttachmentThumbnail(refType, refId);
  const [open, setOpen] = useState(false);
  const first = files[0];
  const Icon = first ? getFileIcon(first.contentType, first.name) : Paperclip;
  const isImage = first?.contentType.toLowerCase().startsWith("image/");

  return (
    <div ref={ref} className={visible && !isLoading && !first ? "hidden" : "shrink-0"}>
      {first ? (
        <button
          type="button"
          aria-label={`Ver archivos de ${label}`}
          title={`${first.name} · ${files.length} ${files.length === 1 ? "archivo" : "archivos"}`}
          className="rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => setOpen(true)}
        >
          <Avatar key={`${first.id}:${first.url}`} className="size-9 overflow-hidden rounded-lg after:rounded-lg">
            {isImage && first.url && <AvatarImage src={first.url} alt="" loading="lazy" className="rounded-lg" />}
            <AvatarFallback className="rounded-lg"><Icon aria-hidden="true" className="size-4" /></AvatarFallback>
          </Avatar>
        </button>
      ) : !visible || isLoading ? (
        <div aria-hidden="true" className="size-9 animate-pulse rounded-lg bg-muted/40" />
      ) : null}
      {open && files.length > 0 && <AttachmentPreviewDialog files={files} onClose={() => setOpen(false)} />}
    </div>
  );
}
