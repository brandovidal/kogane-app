import { attachmentKeys } from "@/features/attachments/constants/query-keys";
import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "@/shared/api/client";
import type { paths } from "@/shared/api/schema";
import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";

export const commitmentKeys = {
  all: ["commitments"] as const,
  list: (filter: CommitmentFilter) => ["commitments", "list", filter] as const,
  detail: (id: string) => ["commitments", "detail", id] as const,
};

type CommitmentFilter = NonNullable<
  paths["/v1/commitments"]["get"]["parameters"]["query"]
>;
export type CommitmentBody = Schemas["CreateCommitmentDto"];
export type CommitmentPatch = Schemas["UpdateCommitmentDto"];
export type ContributionBody = Schemas["ContributionDto"];

// The installments are fixed costs: they move the month, the budget and the calendar too
const invalidate = [
  commitmentKeys.all,
  ["expenses", "fixed-costs"],
  ["summary"],
  ["calendar"],
];

// Loans and investments with their progress (P27, D99)
export const useCommitments = (filter: CommitmentFilter = {}) =>
  useQuery({
    queryKey: commitmentKeys.list(filter),
    queryFn: () =>
      unwrap(api.GET("/v1/commitments", { params: { query: filter } })),
  });

// One commitment with its installments and contributions
export const useCommitment = (id: string | null) =>
  useQuery({
    queryKey: commitmentKeys.detail(id ?? ""),
    queryFn: () =>
      unwrap(
        api.GET("/v1/commitments/{id}", { params: { path: { id: id! } } }),
      ),
    enabled: !!id,
  });

export const useCreateCommitment = () =>
  useApiMutation(
    (body: CommitmentBody) => unwrap(api.POST("/v1/commitments", { body })),
    {
      invalidate,
      success: "Compromiso creado",
    },
  );

export const useUpdateCommitment = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: CommitmentPatch }) =>
      unwrap(
        api.PATCH("/v1/commitments/{id}", { params: { path: { id } }, body }),
      ),
    { invalidate, success: "Guardado" },
  );

export const useDeleteCommitment = () =>
  useApiMutation(
    (id: string) =>
      unwrap(api.DELETE("/v1/commitments/{id}", { params: { path: { id } } })),
    {
      invalidate: [...invalidate, attachmentKeys.all],
      success: "Compromiso eliminado (sus cuotas siguen en Costos fijos)",
    },
  );

export const useCreateInstallments = () =>
  useApiMutation(
    (id: string) =>
      unwrap(
        api.POST("/v1/commitments/{id}/installments", {
          params: { path: { id } },
        }),
      ),
    {
      invalidate,
      success: ({ created }) =>
        created ? `${created} cuota(s) creadas` : "No faltaba ninguna cuota",
    },
  );

export const useSaveContribution = () =>
  useApiMutation(
    ({
      id,
      contributionId,
      body,
    }: {
      id: string;
      contributionId?: string;
      body: ContributionBody;
    }) =>
      contributionId
        ? unwrap(
            api.PATCH("/v1/commitments/{id}/contributions/{contributionId}", {
              params: { path: { id, contributionId } },
              body,
            }),
          )
        : unwrap(
            api.POST("/v1/commitments/{id}/contributions", {
              params: { path: { id } },
              body,
            }),
          ),
    { invalidate: [commitmentKeys.all], success: "Aporte guardado" },
  );

export const useDeleteContribution = () =>
  useApiMutation(
    ({ id, contributionId }: { id: string; contributionId: string }) =>
      unwrap(
        api.DELETE("/v1/commitments/{id}/contributions/{contributionId}", {
          params: { path: { id, contributionId } },
        }),
      ),
    {
      invalidate: [commitmentKeys.all, attachmentKeys.all],
      success: "Aporte eliminado",
    },
  );
