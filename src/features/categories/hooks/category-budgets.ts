import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  deleteCategoryBudget,
  getCategoryBudgets,
  saveCategoryBudget,
  type UpsertCategoryBudgetDto,
} from "../services/category-budget.service";
import type { Schemas } from "@/shared/api/client";

// Spent vs limit per category of a month, your part only (D71, D73)
export type CategoryBudgetLine =
  Schemas["CategoryBudgetLineListResponseDto"]["data"][number];
export type CategoryBudgetBody = UpsertCategoryBudgetDto;

export const useCategoryBudgets = (month: number, year: number) =>
  useQuery({
    queryKey: ["category-budgets", month, year],
    queryFn: () => getCategoryBudgets({ month, year }),
  });

const afterLimit = [["category-budgets"], ["summary"]];

export const useSaveCategoryBudget = () =>
  useApiMutation((body: CategoryBudgetBody) => saveCategoryBudget(body), {
    invalidate: afterLimit,
    success: "Límite guardado",
  });

export const useDeleteCategoryBudget = () =>
  useApiMutation((id: string) => deleteCategoryBudget(id), {
    invalidate: afterLimit,
    success: "Límite quitado",
  });
