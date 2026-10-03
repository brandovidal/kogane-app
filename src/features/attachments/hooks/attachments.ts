import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, api, apiFetch, unwrap } from "@/shared/api/client";
import type { Attachment, AttachmentRefType } from "@/shared/api/types";
import {
  errorMessage,
  useApiMutation,
} from "@/shared/api/hooks/use-api-mutation";
import { attachmentKeys } from "../constants/query-keys";

// ==================== Files (D100) ====================

// The files of one record, each with a signed link that lasts a few minutes
export interface AttachmentQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

export const useAttachments = (
  refType: AttachmentRefType,
  refId: string,
  options: AttachmentQueryOptions = {},
) =>
  useQuery({
    queryKey: attachmentKeys.list(refType, refId),
    queryFn: () =>
      unwrap(
        api.GET("/v1/attachments", { params: { query: { refType, refId } } }),
      ),
    staleTime: 0,
    ...options,
  });

export interface AttachmentUpload {
  file: File;
  refType: AttachmentRefType;
  refId: string;
  kind: Attachment["kind"];
}

// Multipart through the /api proxy (≤ 15 MB, images and documents)
export function useUploadAttachment({
  quiet = false,
}: { quiet?: boolean } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: attachmentKeys.upload,
    mutationFn: async ({
      file,
      refType,
      refId,
      kind,
    }: AttachmentUpload): Promise<Attachment> => {
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
      if (!response.ok) {
        throw new ApiError(
          response.status,
          body.code ?? "UNKNOWN_ERROR",
          body.message ?? response.statusText,
          body.details,
        );
      }
      return body.data as Attachment;
    },
    onSuccess: async () => {
      await Promise.all(
        [
          attachmentKeys.all,
          ["commitments"],
          ["expenses"],
          ["summary"],
          ["history"],
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
      if (!quiet) toast.success("Archivo adjuntado");
    },
    onError: (error) => {
      if (!quiet) toast.error(errorMessage(error));
    },
  });
}

export const useDeleteAttachment = () =>
  useApiMutation(
    (id: string) =>
      unwrap(api.DELETE("/v1/attachments/{id}", { params: { path: { id } } })),
    {
      invalidate: [attachmentKeys.all, ["commitments"]],
      success: "Archivo eliminado",
    },
  );
