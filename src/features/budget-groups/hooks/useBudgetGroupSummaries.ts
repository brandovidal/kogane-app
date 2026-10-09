import { useBudgetGroups, useCategories } from "@/shared/api/hooks/catalogs";
import { useSummary } from "@/features/budget/hooks/summary";
import { buildBudgetGroupSummaries } from "../services/budget-group.service";

export function useBudgetGroupSummaries(month: number, year: number) {
  const summary = useSummary(month, year).data;
  const groups = useBudgetGroups().data ?? [];
  const categories = useCategories().data ?? [];
  const spending = (summary?.byCategory ?? []).map((line) => ({
    categoryId: line.categoryId,
    amount: line.spent,
    amountInPen: null,
  }));

  const salary = summary?.budget?.salary ?? 0;
  return {
    salary,
    groups,
    summaries: buildBudgetGroupSummaries(groups, categories, spending, salary),
  };
}
