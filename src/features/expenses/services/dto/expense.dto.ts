import type { ExpenseByResource, ExpenseResource } from "@/shared/api/types";
import type { Schemas } from "@/shared/api/client";
import type { operations } from "@/shared/api/schema";

export type ExpenseListQuery = Pick<
  NonNullable<
    operations["ExpensesController_findMany_v1"]["parameters"]["query"]
  >,
  "month" | "year" | "kind"
>;
export type ExpenseBodyDto = Schemas["ExpenseBodyDto"];
export type ExpensePatchDto = Schemas["ExpensePatchDto"];
// The endpoint validates its concrete resource schema at runtime; this form
// submits both full creates and partial updates across expense resources.
export type ExpenseInputDto = Record<string, unknown>;
export type ExpenseListItem<R extends ExpenseResource> = ExpenseByResource[R];
export type MoveSeriesDto = Schemas["MoveSeriesDto"];
