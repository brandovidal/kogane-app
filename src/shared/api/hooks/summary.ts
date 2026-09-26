import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "../client";
import { useApiMutation } from "./use-api-mutation";

export const summaryKeys = { month: (month: number, year: number) => ["summary", month, year] as const };

// Totals of the month, salary, limit, surplus and budget groups (/v1/summary)
export const useSummary = (month: number, year: number) =>
  useQuery({
    queryKey: summaryKeys.month(month, year),
    queryFn: () => unwrap(api.GET("/v1/summary", { params: { query: { month, year } } })),
  });

export const useSetBudget = () =>
  useApiMutation((body: Schemas["MonthlyBudgetDto"]) => unwrap(api.PUT("/v1/summary/budget", { body })), {
    invalidate: [["summary"]],
    success: "Presupuesto guardado",
  });

// Salary, extras, spent and surplus of the last months up to month/year, oldest first (one call, D78)
export const useSummaryHistory = (month: number, year: number, months = 6) =>
  useQuery({
    queryKey: ["summary", "history", month, year, months],
    queryFn: () => unwrap(api.GET("/v1/summary/history", { params: { query: { month, year, months } } })),
  });

// What adds to the budget besides fixed costs, cards and day to day (D96, D107): Recurrentes and Plataformas
export const useBudgetSettings = () =>
  useQuery({ queryKey: ["summary", "budget-settings"], queryFn: () => unwrap(api.GET("/v1/budget-settings")) });

export const useSaveBudgetSettings = () =>
  useApiMutation(
    (body: Schemas["UpdateBudgetSettingsDto"]) => unwrap(api.PUT("/v1/budget-settings", { body })),
    { invalidate: [["summary"]], success: "Presupuesto actualizado" },
  );
