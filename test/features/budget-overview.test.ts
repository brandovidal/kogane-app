import { describe, expect, it } from "vitest";

import { buildOverview } from "@/features/budget/lib/budget-overview";
import type { BudgetGroupSummary } from "@/features/budget-groups/services/budget-group.service";
import type { CategoryBudgetLine } from "@/features/categories/hooks/category-budgets";

const group = (
  id: string,
  percentage: number,
  assigned: number,
  categories: BudgetGroupSummary["categories"],
) =>
  ({
    group: { id, name: id, emoji: "📦", percentage, order: 1 },
    assignedAmount: assigned,
    spentAmount: categories.reduce((s, c) => s + c.spent, 0),
    categoryIds: categories.map((c) => c.id),
    categories,
  }) as unknown as BudgetGroupSummary;

const cat = (id: string, spent: number) => ({
  id,
  name: id,
  color: "#000",
  icon: null,
  spent,
});
const line = (categoryId: string, over: Partial<CategoryBudgetLine>) =>
  ({
    categoryId,
    spent: 0,
    limit: null,
    percent: 0,
    status: "ok",
    ...over,
  }) as CategoryBudgetLine;

describe("budget overview", () => {
  const summaries = [
    group("fijos", 40, 2000, [cat("casa", 1500), cat("salud", 300)]),
    group("sin-culpa", 60, 3000, [cat("comida", 400)]),
  ];

  it("joins limits to categories and keeps the group sums", () => {
    const { groups, totals } = buildOverview(summaries, [
      line("casa", { spent: 1500, limit: 1000, status: "over" }),
      line("comida", { spent: 400, limit: 600 }),
    ]);
    const casa = groups[0].categories[0];
    expect(casa).toMatchObject({ limit: 1000, percent: 150, status: "over" });
    expect(groups[0]).toMatchObject({
      spent: 1800,
      assigned: 2000,
      available: 200,
    });
    expect(groups[1].categories[0]).toMatchObject({
      limit: 600,
      percent: 67,
      status: "ok",
    });
    expect(totals).toEqual({ limit: 5000, spent: 2200, percent: 44 });
  });

  it("leaves a category without limit and without a bar", () => {
    const { groups } = buildOverview(summaries, []);
    expect(groups[0].categories[1]).toMatchObject({
      limit: null,
      percent: 0,
      status: "ok",
      spent: 300,
    });
  });

  it("falls back to over when the spend passes a limit the API did not flag", () => {
    const { groups } = buildOverview(summaries, [
      line("salud", { spent: 300, limit: 200, status: "ok" }),
    ]);
    expect(groups[0].categories[1].status).toBe("over");
  });
});
