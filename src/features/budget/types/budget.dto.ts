import type { Schemas } from "@/shared/api/client";
import type { operations } from "@/shared/api/schema";

export type SummaryQuery = NonNullable<
  operations["SummaryController_get_v1"]["parameters"]["query"]
>;
export type SummaryHistoryQuery = NonNullable<
  operations["SummaryController_history_v1"]["parameters"]["query"]
>;
export type MonthlyBudgetDto = Schemas["MonthlyBudgetDto"];
export type UpdateBudgetSettingsDto = Schemas["UpdateBudgetSettingsDto"];
