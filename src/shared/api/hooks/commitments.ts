import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, api, apiFetch, unwrap, type Schemas } from "../client";
import type { paths } from "../schema";
import type { Attachment, AttachmentRefType } from "../types";
import { errorMessage, useApiMutation } from "./use-api-mutation";

export const commitmentKeys = {
  all: ["commitments"] as const,
  list: (filter: CommitmentFilter) => ["commitments", "list", filter] as const,
  detail: (id: string) => ["commitments", "detail", id] as const,
};

export const attachmentKeys = {
  all: ["attachments"] as const,
  list: (refType: AttachmentRefType, refId: string) => ["attachments", refType, refId] as const,
};

type CommitmentFilter = NonNullable<paths["/v1/commitments"]["get"]["parameters"]["query"]>;
export type CommitmentBody = Schemas["CreateCommitmentDto"];
export type CommitmentPatch = Schemas["UpdateCommitmentDto"];
export type ContributionBody = Schemas["ContributionDto"];

// The installments are fixed costs: they move the month, the budget and the calendar too
const invalidate = [commitmentKeys.all, ["expenses", "fixed-costs"], ["summary"], ["calendar"]];

// Loans and investments with their progress (P27, D99)
export const useCommitments = (filter: CommitmentFilter = {}) =>
  useQuery({
    queryKey: commitmentKeys.list(filter),
    queryFn: () => unwrap(api.GET("/v1/commitments", { params: { query: filter } })),
  });

// One commitment with its installments and contributions
export const useCommitment = (id: string | null) =>
  useQuery({
    queryKey: commitmentKeys.detail(id ?? ""),
    queryFn: () => unwrap(api.GET("/v1/commitments/{id}", { params: { path: { id: id! } } })),
    enabled: !!id,
  });

export const useCreateCommitment = () =>
  useApiMutation((body: CommitmentBody) => unwrap(api.POST("/v1/commitments", { body })), {
    invalidate,
    success: "Compromiso creado",
  });

export const useUpdateCommitment = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: CommitmentPatch }) =>
      unwrap(api.PATCH("/v1/commitments/{id}", { params: { path: { id } }, body })),
    { invalidate, success: "Guardado" },
  );

export const useDeleteCommitment = () =>
  useApiMutation((id: string) => unwrap(api.DELETE("/v1/commitments/{id}", { params: { path: { id } } })), {
    invalidate: [...invalidate, attachmentKeys.all],
    success: "Compromiso eliminado (sus cuotas siguen en Costos fijos)",
  });

export const useCreateInstallments = () =>
  useApiMutation(
    (id: string) => unwrap(api.POST("/v1/commitments/{id}/installments", { params: { path: { id } } })),
    {
      invalidate,
      success: ({ created }) => (created ? `${created} cuota(s) creadas` : "No faltaba ninguna cuota"),
    },
  );

export const useSaveContribution = () =>
  useApiMutation(
    ({ id, contributionId, body }: { id: string; contributionId?: string; body: ContributionBody }) =>
      contributionId
        ? unwrap(
            api.PATCH("/v1/commitments/{id}/contributions/{contributionId}", {
              params: { path: { id, contributionId } },
              body,
            }),
          )
        : unwrap(api.POST("/v1/commitments/{id}/contributions", { params: { path: { id } }, body })),
    { invalidate: [commitmentKeys.all], success: "Aporte guardado" },
  );

export const useDeleteContribution = () =>
  useApiMutation(
    ({ id, contributionId }: { id: string; contributionId: string }) =>
      unwrap(
        api.DELETE("/v1/commitments/{id}/contributions/{contributionId}", { params: { path: { id, contributionId } } }),
      ),
    { invalidate: [commitmentKeys.all, attachmentKeys.all], success: "Aporte eliminado" },
  );

// ==================== Files (D100) ====================

// The files of one record, each with a signed link that lasts a few minutes
export const useAttachments = (refType: AttachmentRefType, refId: string) =>
  useQuery({
    queryKey: attachmentKeys.list(refType, refId),
    queryFn: () => unwrap(api.GET("/v1/attachments", { params: { query: { refType, refId } } })),
    staleTime: 0,
  });

export interface AttachmentUpload {
  file: File;
  refType: AttachmentRefType;
  refId: string;
  kind: Attachment["kind"];
}

// Multipart through the /api proxy (≤ 15 MB, images and documents)
export function useUploadAttachment({ quiet = false }: { quiet?: boolean } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, refType, refId, kind }: AttachmentUpload): Promise<Attachment> => {
      const form = new FormData();
      form.set("file", file);
      form.set("refType", refType);
      form.set("refId", refId);
      form.set("kind", kind);
      const response = await apiFetch("/api/v1/attachments", { method: "POST", body: form, headers: { accept: "application/json" } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new ApiError(response.status, body.code ?? "UNKNOWN_ERROR", body.message ?? response.statusText, body.details);
      }
      return body.data as Attachment;
    },
    onSuccess: async () => {
      await Promise.all([attachmentKeys.all, commitmentKeys.all, ["expenses"]].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      if (!quiet) toast.success("Archivo adjuntado");
    },
    onError: (error) => { if (!quiet) toast.error(errorMessage(error)); },
  });
}

export const useDeleteAttachment = () =>
  useApiMutation((id: string) => unwrap(api.DELETE("/v1/attachments/{id}", { params: { path: { id } } })), {
    invalidate: [attachmentKeys.all, commitmentKeys.all],
    success: "Archivo eliminado",
  });
