import { ApiError, api, apiFetch, unwrap } from "@/shared/api/client";
import type { Attachment, AttachmentRefType } from "@/shared/api/types";
import type { AttachmentUploadDto } from "../types/attachment.dto";
export type { AttachmentUploadDto } from "../types/attachment.dto";

export const getAttachments = (refType: AttachmentRefType, refId: string) =>
  unwrap(api.GET("/v1/attachments", { params: { query: { refType, refId } } }));

export async function uploadAttachment({
  file,
  refType,
  refId,
  kind,
}: AttachmentUploadDto): Promise<Attachment> {
  const form = new FormData();
  form.set("file", file);
  form.set("refType", refType);
  form.set("refId", refId);
  form.set("kind", kind);
  const response = await apiFetch("/api/v1/attachments", {
    method: "POST",
    body: form,
    headers: { accept: "application/json" },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      response.status,
      body.code ?? "UNKNOWN_ERROR",
      body.message ?? response.statusText,
      body.details,
    );
  return body.data as Attachment;
}

export const deleteAttachment = (id: string) =>
  unwrap(api.DELETE("/v1/attachments/{id}", { params: { path: { id } } }));
