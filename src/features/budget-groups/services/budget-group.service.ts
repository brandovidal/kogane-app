import type { BudgetGroup, Category } from "@/shared/api/types";

export interface BudgetGroupSummary {
  group: BudgetGroup;
  assignedAmount: number;
  spentAmount: number;
  categoryIds: string[];
  categories: Array<{ id: string; name: string; color: string; icon: string | null; spent: number }>;
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
        .map((category) => ({ id: category.id, name: category.name, color: category.color, icon: category.icon, spent: spentBy(category.id) }));

      return {
        group,
        assignedAmount: (salary * group.percentage) / 100,
        spentAmount: groupCategories.reduce((sum, category) => sum + category.spent, 0),
        categoryIds: groupCategories.map((category) => category.id),
        categories: groupCategories,
      };
    });
}

// Spending per category comes from /v1/summary: your part only (D71, D73), the same numbers as the Resumen
