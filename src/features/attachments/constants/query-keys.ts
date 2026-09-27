import type { AttachmentRefType } from "@/shared/api/types";

export const attachmentKeys = {
  all: ["attachments"] as const,
  list: (refType: AttachmentRefType, refId: string) => ["attachments", refType, refId] as const,
};
