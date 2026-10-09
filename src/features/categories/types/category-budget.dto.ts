import type { Schemas } from "@/shared/api/client";
import type { operations } from "@/shared/api/schema";

export type CategoryBudgetQuery = NonNullable<
  operations["CategoryBudgetsController_list_v1"]["parameters"]["query"]
>;
export type UpsertCategoryBudgetDto = Schemas["UpsertCategoryBudgetDto"];
