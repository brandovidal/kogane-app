import { describe, expect, it } from "vitest";

import {
  buildCategoryBreakdown,
  buildCreditCardSummaries,
  buildDashboardSummary,
  lastMonths,
} from "@/features/dashboard/dashboard.service";
import type { Category, CreditCardExpense, PaymentMethod, Summary } from "@/shared/api/types";

const summary = {
  month: 9,
  year: 2026,
  totals: [
    { destination: "fixed_cost", currency: "PEN", personId: "p1", total: 1000, count: 2 },
    { destination: "credit_card", currency: "PEN", personId: "p1", total: 300, count: 3 },
    { destination: "credit_card", currency: "USD", personId: "p1", total: 50, count: 1 },
    { destination: "subscription", currency: "PEN", personId: "p1", total: 45, count: 1 },
  ],
  spentPen: 1345,
  budget: { salary: 5000, limitPercent: 80, limit: 4000 },
  surplus: 3655,
  budgetGroups: [],
} as Summary;

const records = [
  { amount: 100, amountInPen: 100, expenseType: "essential", categoryId: "food" },
  { amount: 10, amountInPen: 37.5, expenseType: "guilty_pleasure", categoryId: "fun" },
  { amount: 50, amountInPen: null, expenseType: "essential", categoryId: "food" },
];

describe("dashboard", () => {
  it("should take the totals of /v1/summary in soles and split essential and guilty pleasure", () => {
    expect(buildDashboardSummary(summary, records)).toEqual({
      totalExpenses: 1345,
      totalFixedCosts: 1000,
      totalSubscriptions: 45,
      totalCreditCards: 300,
      salary: 5000,
      surplus: 3655,
      totalNecesario: 150,
      totalConCulpa: 37.5,
    });
  });

  it("should work without data yet (no salary, no summary)", () => {
    expect(buildDashboardSummary(undefined, [])).toMatchObject({ totalExpenses: 0, salary: 0, surplus: 0 });
  });

  it("should add up each category and leave out the empty ones", () => {
    const categories = [
      { id: "food", name: "Comida", color: "#f00" },
      { id: "fun", name: "Ocio", color: "#0f0" },
      { id: "home", name: "Casa", color: "#00f" },
    ] as Category[];

    expect(buildCategoryBreakdown(categories, records)).toEqual([
      { name: "Comida", color: "#f00", amount: 150 },
      { name: "Ocio", color: "#0f0", amount: 37.5 },
    ]);
  });

  it("should total each card with its expenses of the month", () => {
    const cards = [
      { id: "io", code: "IO", name: "IO", color: null, billingCloseDay: 25, paymentDueDay: 12 },
      { id: "new", code: null, name: "Nueva", color: "#123", billingCloseDay: null, paymentDueDay: null },
    ] as PaymentMethod[];
    const expenses = [
      { paymentMethodId: "io", amount: 100, amountInPen: 100 },
      { paymentMethodId: "io", amount: 20, amountInPen: 75 },
    ] as CreditCardExpense[];

    expect(buildCreditCardSummaries(cards, expenses)).toEqual([
      { code: "IO", name: "IO", color: null, billingCloseDay: 25, paymentDueDay: 12, total: 175 },
      { code: "Nueva", name: "Nueva", color: "#123", billingCloseDay: 0, paymentDueDay: 0, total: 0 },
    ]);
  });

  it("should list the last months across the year end", () => {
    expect(lastMonths(2, 2026, 3)).toEqual([
      { month: 12, year: 2025 },
      { month: 1, year: 2026 },
      { month: 2, year: 2026 },
    ]);
  });
});
