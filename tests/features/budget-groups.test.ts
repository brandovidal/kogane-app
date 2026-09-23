import { describe, expect, it } from "vitest";

import { buildBudgetGroupSummaries } from "@/features/budget-groups/budget-group.service";
import type { BudgetGroup, Category } from "@/shared/api/types";

describe("budget groups", () => {
  it("should give each group salary × % and what its categories spent, in order", () => {
    const groups = [
      { id: "savings", name: "Ahorro", emoji: "💰", percentage: 14, order: 2 },
      { id: "fixed", name: "Costos fijos", emoji: "🏠", percentage: 36, order: 1 },
    ] as BudgetGroup[];
    const categories = [
      { id: "rent", name: "Alquiler", color: "#111", budgetGroupId: "fixed" },
      { id: "water", name: "Agua", color: "#222", budgetGroupId: "fixed" },
      { id: "loose", name: "Sin grupo", color: "#333", budgetGroupId: null },
    ] as Category[];
    const spending = [
      { categoryId: "rent", amount: 1000, amountInPen: null },
      { categoryId: "water", amount: 10, amountInPen: 37.5 },
      { categoryId: "loose", amount: 99, amountInPen: null },
    ];

    const [fixed, savings] = buildBudgetGroupSummaries(groups, categories, spending, 5000);

    expect(fixed).toMatchObject({ assignedAmount: 1800, spentAmount: 1037.5, categoryIds: ["rent", "water"] });
    expect(savings).toMatchObject({ assignedAmount: 700, spentAmount: 0, categories: [] });
  });
});
