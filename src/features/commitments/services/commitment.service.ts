import { api, unwrap } from "@/shared/api/client";
import type {
  CommitmentQuery,
  ContributionDto,
  CreateCommitmentDto,
  UpdateCommitmentDto,
} from "../types/commitment.dto";
export type {
  CommitmentQuery,
  ContributionDto,
  CreateCommitmentDto,
  UpdateCommitmentDto,
} from "../types/commitment.dto";

export const getCommitments = (query: CommitmentQuery) =>
  unwrap(api.GET("/v1/commitments", { params: { query } }));
export const getCommitment = (id: string) =>
  unwrap(api.GET("/v1/commitments/{id}", { params: { path: { id } } }));
export const createCommitment = (body: CreateCommitmentDto) =>
  unwrap(api.POST("/v1/commitments", { body }));
export const updateCommitment = (id: string, body: UpdateCommitmentDto) =>
  unwrap(api.PATCH("/v1/commitments/{id}", { params: { path: { id } }, body }));
export const deleteCommitment = (id: string) =>
  unwrap(api.DELETE("/v1/commitments/{id}", { params: { path: { id } } }));
export const createInstallments = (id: string) =>
  unwrap(
    api.POST("/v1/commitments/{id}/installments", { params: { path: { id } } }),
  );
export const saveContribution = (
  id: string,
  body: ContributionDto,
  contributionId?: string,
) =>
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
      );
export const deleteContribution = (id: string, contributionId: string) =>
  unwrap(
    api.DELETE("/v1/commitments/{id}/contributions/{contributionId}", {
      params: { path: { id, contributionId } },
    }),
  );
