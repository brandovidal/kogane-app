import type { ExpenseByResource, ExpenseResource } from "@/shared/api/types";
import type { Schemas } from "@/shared/api/client";
import type { operations } from "@/shared/api/schema";

export type ExpenseListQuery = Pick<
  NonNullable<
    operations["ExpensesController_findMany_v1"]["parameters"]["query"]
  >,
  "month" | "year" | "kind"
>;
export type ExpenseInputDto = Record<string, unknown>;
export type ExpenseBodyDto = Schemas["ExpenseBodyDto"];
export type ExpensePatchDto = Schemas["ExpensePatchDto"];
export type ExpenseListItem<R extends ExpenseResource> = ExpenseByResource[R];
export type MoveSeriesDto = Schemas["MoveSeriesDto"];
