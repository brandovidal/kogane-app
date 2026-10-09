import { api, unwrap } from "@/shared/api/client";
import type {
  CategoryBudgetQuery,
  UpsertCategoryBudgetDto,
} from "../types/category-budget.dto";
export type {
  CategoryBudgetQuery,
  UpsertCategoryBudgetDto,
} from "../types/category-budget.dto";

export const getCategoryBudgets = (query: CategoryBudgetQuery) =>
  unwrap(api.GET("/v1/category-budgets", { params: { query } }));

export const saveCategoryBudget = (body: UpsertCategoryBudgetDto) =>
  unwrap(api.PUT("/v1/category-budgets", { body }));

export const deleteCategoryBudget = (id: string) =>
  unwrap(api.DELETE("/v1/category-budgets/{id}", { params: { path: { id } } }));
