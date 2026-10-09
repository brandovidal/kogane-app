import { useState } from "react";
import { Download, LoaderCircle, Trash2 } from "lucide-react";
import type { Attachment as AttachmentRecord } from "@/shared/api/types";
import { getFileIcon } from "@/shared/lib/file-icons";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/ui/attachment";
import { ATTACHMENT_KIND_LABELS } from "../constants/attachments";
import { formatAttachmentSize } from "../lib/attachment-size";

export interface AttachmentFileCardProps {
  file: Pick<
    AttachmentRecord,
    "name" | "contentType" | "kind" | "sizeBytes" | "url"
  >;
  uploading?: boolean;
  onRemove?: () => void;
  onPreview?: () => void;
  removeDisabled?: boolean;
}

export function AttachmentFileCard({
  file,
  uploading,
  onRemove,
  onPreview,
  removeDisabled,
}: AttachmentFileCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const isImage =
    !!file.url &&
    file.contentType.toLowerCase().startsWith("image/") &&
    !imageFailed;
  const Icon = getFileIcon(file.contentType, file.name);

  return (
    <>
      <Attachment
        state={uploading ? "uploading" : "done"}
        className="w-full flex-nowrap rounded-lg"
      >
        <AttachmentMedia variant={isImage ? "image" : "icon"}>
          {uploading ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : isImage ? (
            <img
              src={file.url ?? ""}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Icon aria-hidden="true" />
          )}
          {file.url && !uploading && onPreview && (
            <AttachmentTrigger
              aria-label={`Ver archivo ${file.name}`}
              title={`Ver archivo ${file.name}`}
              onClick={onPreview}
              className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            />
          )}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle title={file.name}>{file.name}</AttachmentTitle>
          <AttachmentDescription>
            {uploading
              ? "Subiendo…"
              : (ATTACHMENT_KIND_LABELS[file.kind] ?? file.kind)}{" "}
            · {formatAttachmentSize(file.sizeBytes)}
          </AttachmentDescription>
          {uploading && (
            <div
              role="progressbar"
              aria-label={`Subiendo ${file.name}`}
              aria-valuetext="Subida en curso"
              className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted"
            >
              <span className="block h-full w-1/3 animate-pulse rounded-full bg-brand" />
            </div>
          )}
        </AttachmentContent>
        {(onRemove || (file.url && !uploading)) && (
          <AttachmentActions>
            {file.url && !uploading && (
              <a
                href={file.url}
                download={file.name}
                aria-label={`Descargar ${file.name}`}
                title="Descargar archivo"
                className="relative z-20 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Download aria-hidden="true" className="size-4" />
              </a>
            )}
            {onRemove && (
              <AttachmentAction
                type="button"
                aria-label={`Eliminar ${file.name}`}
                disabled={removeDisabled || uploading}
                className="text-destructive"
                onClick={onRemove}
              >
                <Trash2 aria-hidden="true" />
              </AttachmentAction>
            )}
          </AttachmentActions>
        )}
      </Attachment>
    </>
  );
}
