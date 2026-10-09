import { attachmentKeys } from "@/features/attachments/constants/query-keys";
import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  createCommitment,
  createInstallments,
  deleteCommitment,
  deleteContribution,
  getCommitment,
  getCommitments,
  saveContribution,
  updateCommitment,
  type CommitmentQuery,
  type ContributionDto,
  type CreateCommitmentDto,
  type UpdateCommitmentDto,
} from "../services/commitment.service";

export const commitmentKeys = {
  all: ["commitments"] as const,
  list: (filter: CommitmentFilter) => ["commitments", "list", filter] as const,
  detail: (id: string) => ["commitments", "detail", id] as const,
};

type CommitmentFilter = CommitmentQuery;
export type CommitmentBody = CreateCommitmentDto;
export type CommitmentPatch = UpdateCommitmentDto;
export type ContributionBody = ContributionDto;

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
    queryFn: () => getCommitments(filter),
  });

// One commitment with its installments and contributions
export const useCommitment = (id: string | null) =>
  useQuery({
    queryKey: commitmentKeys.detail(id ?? ""),
    queryFn: () => getCommitment(id!),
    enabled: !!id,
  });

export const useCreateCommitment = () =>
  useApiMutation((body: CommitmentBody) => createCommitment(body), {
    invalidate,
    success: "Compromiso creado",
  });

export const useUpdateCommitment = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: CommitmentPatch }) =>
      updateCommitment(id, body),
    { invalidate, success: "Guardado" },
  );

export const useDeleteCommitment = () =>
  useApiMutation((id: string) => deleteCommitment(id), {
    invalidate: [...invalidate, attachmentKeys.all],
    success: "Compromiso eliminado (sus cuotas siguen en Costos fijos)",
  });

export const useCreateInstallments = () =>
  useApiMutation((id: string) => createInstallments(id), {
    invalidate,
    success: ({ created }) =>
      created ? `${created} cuota(s) creadas` : "No faltaba ninguna cuota",
  });

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
    }) => saveContribution(id, body, contributionId),
    { invalidate: [commitmentKeys.all], success: "Aporte guardado" },
  );

export const useDeleteContribution = () =>
  useApiMutation(
    ({ id, contributionId }: { id: string; contributionId: string }) =>
      deleteContribution(id, contributionId),
    {
      invalidate: [commitmentKeys.all, attachmentKeys.all],
      success: "Aporte eliminado",
    },
  );
