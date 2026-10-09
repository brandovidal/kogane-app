import type { Attachment, AttachmentRefType } from "@/shared/api/types";

export interface AttachmentUploadDto {
  file: File;
  refType: AttachmentRefType;
  refId: string;
  kind: Attachment["kind"];
}
