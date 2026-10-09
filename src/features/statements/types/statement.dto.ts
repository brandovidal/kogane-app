import type { Schemas } from "@/shared/api/client";

export type UpdateStatementDto = Schemas["UpdateStatementDto"];
export type AssignRowsDto = Schemas["AssignRowsDto"];
export type CreateNewRowsDto = Schemas["CreateNewRowsDto"];
export type UpdateRowDto = Schemas["UpdateRowDto"];

export interface StatementUploadDto {
  file: File;
  password?: string;
  paymentMethodId?: string;
  personId?: string;
  savePassword?: boolean;
  signal?: AbortSignal;
}
