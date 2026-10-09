import type { Schemas } from "@/shared/api/client";
import type { paths } from "@/shared/api/schema";

export type DebtQuery = NonNullable<
  paths["/v1/debts"]["get"]["parameters"]["query"]
>;
export type CardCheckQuery = NonNullable<
  paths["/v1/debts/card-check"]["get"]["parameters"]["query"]
>;
export type CreateDebtDto = Schemas["CreateDebtDto"];
export type UpdateDebtDto = Schemas["UpdateDebtDto"];
export type DebtPaymentDto = Schemas["DebtPaymentDto"];
export type DebtBulkDto = Schemas["DebtBulkDto"];
