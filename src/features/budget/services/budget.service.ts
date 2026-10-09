import { api, unwrap } from "@/shared/api/client";
import type {
  MonthlyBudgetDto,
  SummaryHistoryQuery,
  SummaryQuery,
  UpdateBudgetSettingsDto,
} from "../types/budget.dto";
export type {
  MonthlyBudgetDto,
  SummaryHistoryQuery,
  SummaryQuery,
  UpdateBudgetSettingsDto,
} from "../types/budget.dto";

export const getSummary = (query: SummaryQuery) =>
  unwrap(api.GET("/v1/summary", { params: { query } }));

export const setBudget = (body: MonthlyBudgetDto) =>
  unwrap(api.PUT("/v1/summary/budget", { body }));

export const getSummaryHistory = (query: SummaryHistoryQuery) =>
  unwrap(api.GET("/v1/summary/history", { params: { query } }));

export const getBudgetSettings = () => unwrap(api.GET("/v1/budget-settings"));

export const saveBudgetSettings = (body: UpdateBudgetSettingsDto) =>
  unwrap(api.PUT("/v1/budget-settings", { body }));
