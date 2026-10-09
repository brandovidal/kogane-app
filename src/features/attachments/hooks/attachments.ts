import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AttachmentRefType } from "@/shared/api/types";
import {
  errorMessage,
  useApiMutation,
} from "@/shared/api/hooks/use-api-mutation";
import { attachmentKeys } from "../constants/query-keys";
import {
  deleteAttachment,
  getAttachments,
  uploadAttachment,
  type AttachmentUploadDto,
} from "../services/attachment.service";

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
    queryFn: () => getAttachments(refType, refId),
    staleTime: 0,
    ...options,
  });

export type AttachmentUpload = AttachmentUploadDto;
export type { AttachmentUploadDto } from "../services/attachment.service";

// Multipart through the /api proxy (≤ 15 MB, images and documents)
export function useUploadAttachment({
  quiet = false,
}: { quiet?: boolean } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: attachmentKeys.upload,
    mutationFn: uploadAttachment,
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
  useApiMutation((id: string) => deleteAttachment(id), {
    invalidate: [attachmentKeys.all, ["commitments"]],
    success: "Archivo eliminado",
  });
