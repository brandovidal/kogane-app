import { describe, expect, it } from "vitest";

import { donutSlices, incomeOf, limitUsage } from "@/features/budget/budget-view";
import type { Summary } from "@/shared/api/types";

const summary = {
  spentPen: 600,
  extraIncome: 300,
  surplus: 3700,
  budget: { salary: 4000, limitPercent: 50, limit: 2000, isProposal: false },
  byCategory: [
    { categoryId: "food", name: "Comida", color: "#f00", spent: 500 },
    { categoryId: "gifts", name: "Regalos", color: "#0f0", spent: 0 },
    { categoryId: null, name: "Sin categoría", color: "#999", spent: 100 },
  ],
  budgetGroups: [
    { id: "basic", name: "Básicos", emoji: "🏠", spent: 500 },
    { id: "savings", name: "Ahorro", emoji: "💰", spent: 0 },
  ],
} as unknown as Summary;

describe("budget view (D78)", () => {
  it("should draw one slice per category with spending, in its own color", () => {
    expect(donutSlices(summary, "categories")).toEqual([
      { key: "food", name: "Comida", value: 500, fill: "#f00" },
      { key: "none", name: "Sin categoría", value: 100, fill: "#999" },
    ]);
  });

  it("should draw the groups with the theme colors, in a fixed order", () => {
    expect(donutSlices(summary, "groups")).toEqual([{ key: "basic", name: "🏠 Básicos", value: 500, fill: "var(--chart-1)" }]);
    expect(donutSlices(undefined, "groups")).toEqual([]);
  });

  it("should add the extras to the salary and tell how much of the limit was used", () => {
    expect(incomeOf(summary)).toEqual({ salary: 4000, extra: 300, total: 4300 });
    expect(limitUsage(summary)).toBe(30);
    expect(limitUsage(undefined)).toBeNull();
  });
});
