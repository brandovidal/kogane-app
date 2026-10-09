import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  getBudgetSettings,
  getSummary,
  getSummaryHistory,
  saveBudgetSettings,
  setBudget,
  type MonthlyBudgetDto,
  type UpdateBudgetSettingsDto,
} from "../services/budget.service";

export const summaryKeys = {
  month: (month: number, year: number) => ["summary", month, year] as const,
};

// Totals of the month, salary, limit, surplus and budget groups (/v1/summary)
export const useSummary = (month: number, year: number, enabled = true) =>
  useQuery({
    queryKey: summaryKeys.month(month, year),
    enabled,
    queryFn: () => getSummary({ month, year }),
  });

export const useSetBudget = () =>
  useApiMutation((body: MonthlyBudgetDto) => setBudget(body), {
    invalidate: [["summary"]],
    success: "Presupuesto guardado",
  });

// Salary, extras, spent and surplus of the last months up to month/year, oldest first (one call, D78)
export const useSummaryHistory = (month: number, year: number, months = 6) =>
  useQuery({
    queryKey: ["summary", "history", month, year, months],
    queryFn: () => getSummaryHistory({ month, year, months }),
  });

// What adds to the budget besides fixed costs, cards and day to day (D96, D107): Recurrentes and Plataformas
export const useBudgetSettings = () =>
  useQuery({
    queryKey: ["summary", "budget-settings"],
    queryFn: getBudgetSettings,
  });

export const useSaveBudgetSettings = () =>
  useApiMutation((body: UpdateBudgetSettingsDto) => saveBudgetSettings(body), {
    invalidate: [["summary"]],
    success: "Presupuesto actualizado",
  });
