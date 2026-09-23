import { useBudgetGroups, useCategories } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/shared/api/hooks/expenses";
import { useSummary } from "@/shared/api/hooks/summary";
import { EXPENSE_RESOURCES, type BudgetGroup, type Category } from "@/shared/api/types";

export interface BudgetGroupSummary {
  group: BudgetGroup;
  assignedAmount: number;
  spentAmount: number;
  categoryIds: string[];
  categories: Array<{ id: string; name: string; color: string; spent: number }>;
}

interface Spending {
  categoryId: string | null;
  amount: number;
  amountInPen: number | null;
}

// What each budget group got (salary × %) against what its categories spent in the month. Plataformas stay out: the
// card expense is the real charge (D46).
export function buildBudgetGroupSummaries(
  groups: BudgetGroup[],
  categories: Category[],
  spending: Spending[],
  salary: number,
): BudgetGroupSummary[] {
  const spentBy = (categoryId: string) =>
    spending.filter((item) => item.categoryId === categoryId).reduce((sum, item) => sum + (item.amountInPen ?? item.amount), 0);

  return groups
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((group) => {
      const groupCategories = categories
        .filter((category) => category.budgetGroupId === group.id)
        .map((category) => ({ id: category.id, name: category.name, color: category.color, spent: spentBy(category.id) }));

      return {
        group,
        assignedAmount: (salary * group.percentage) / 100,
        spentAmount: groupCategories.reduce((sum, category) => sum + category.spent, 0),
        categoryIds: groupCategories.map((category) => category.id),
        categories: groupCategories,
      };
    });
}

export function useBudgetGroupSummaries(month: number, year: number) {
  const period = { month, year };
  const summary = useSummary(month, year).data;
  const groups = useBudgetGroups().data ?? [];
  const categories = useCategories().data ?? [];
  const daily = useExpenses(EXPENSE_RESOURCES.daily, period).data ?? [];
  const fixedCosts = useExpenses(EXPENSE_RESOURCES.fixedCost, period).data ?? [];
  const cards = useExpenses(EXPENSE_RESOURCES.creditCard, period).data ?? [];

  const salary = summary?.budget?.salary ?? 0;
  return { salary, groups, summaries: buildBudgetGroupSummaries(groups, categories, [...daily, ...fixedCosts, ...cards], salary) };
}
