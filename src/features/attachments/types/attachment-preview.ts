import type { Attachment } from "@/shared/api/types";

export type AttachmentPreview = Pick<Attachment, "id" | "name" | "contentType" | "url" | "kind" | "sizeBytes" | "createdAt">;

export interface AttachmentPreviewDialogProps {
  files: readonly AttachmentPreview[];
  initialIndex?: number;
  onClose: () => void;
}
