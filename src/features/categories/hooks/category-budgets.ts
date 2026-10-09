import { useQuery } from "@tanstack/react-query";
import { api, unwrap, type Schemas } from "@/shared/api/client";
import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";

// Spent vs limit per category of a month, your part only (D71, D73)
export type CategoryBudgetLine =
  Schemas["CategoryBudgetLineListResponseDto"]["data"][number];
export type CategoryBudgetBody = Schemas["UpsertCategoryBudgetDto"];

export const useCategoryBudgets = (month: number, year: number) =>
  useQuery({
    queryKey: ["category-budgets", month, year],
    queryFn: () =>
      unwrap(
        api.GET("/v1/category-budgets", { params: { query: { month, year } } }),
      ),
  });

const afterLimit = [["category-budgets"], ["summary"]];

export const useSaveCategoryBudget = () =>
  useApiMutation(
    (body: CategoryBudgetBody) =>
      unwrap(api.PUT("/v1/category-budgets", { body })),
    {
      invalidate: afterLimit,
      success: "Límite guardado",
    },
  );

export const useDeleteCategoryBudget = () =>
  useApiMutation(
    (id: string) =>
      unwrap(
        api.DELETE("/v1/category-budgets/{id}", { params: { path: { id } } }),
      ),
    { invalidate: afterLimit, success: "Límite quitado" },
  );
