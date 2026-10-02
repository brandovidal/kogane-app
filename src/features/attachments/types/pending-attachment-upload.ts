import type { Attachment } from "@/shared/api/types";

export interface PendingAttachmentUpload {
  id: string;
  file: File;
  kind: Attachment["kind"];
}
