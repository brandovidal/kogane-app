import type { Schemas } from "@/shared/api/client";
import type { operations } from "@/shared/api/schema";

export type IncomeQuery = NonNullable<
  operations["IncomesController_list_v1"]["parameters"]["query"]
>;
export type IncomeBodyDto = Schemas["CreateIncomeDto"];
export type IncomePatchDto = Schemas["UpdateIncomeDto"];
