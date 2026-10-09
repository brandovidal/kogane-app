import type { Schemas } from "@/shared/api/client";
import type { paths } from "@/shared/api/schema";

export type CommitmentQuery = NonNullable<
  paths["/v1/commitments"]["get"]["parameters"]["query"]
>;
export type CreateCommitmentDto = Schemas["CreateCommitmentDto"];
export type UpdateCommitmentDto = Schemas["UpdateCommitmentDto"];
export type ContributionDto = Schemas["ContributionDto"];
