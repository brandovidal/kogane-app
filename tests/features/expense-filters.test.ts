import { describe, expect, it } from "vitest";

import { applyExpenseFilters, hasActiveFilters } from "@/shared/lib/expense-filters";

const records = [
  { description: "Netflix", categoryId: "fun", paymentMethodId: "io", expenseType: "essential", paymentStatus: "pending", period: "monthly", installment: null, othersShare: 32 },
  { description: "Laptop", merchant: "MP*MERCADOLIBRE", categoryId: "tech", paymentMethodId: "io", expenseType: "guilty_pleasure", paymentStatus: "paid", installment: "1/10", othersShare: 0 },
  { description: "Almuerzo", notes: "con el equipo", categoryId: "food", paymentMethodId: "yape", expenseType: "essential", installment: "1/1" },
];

describe("expense filters (D79)", () => {
  it("should search the concept, the merchant and the note without accents or case", () => {
    expect(applyExpenseFilters(records, { q: "mercadolibre" }).map((r) => r.description)).toEqual(["Laptop"]);
    expect(applyExpenseFilters(records, { q: "EQUIPO" }).map((r) => r.description)).toEqual(["Almuerzo"]);
  });

  it("should combine category, payment method, type, status and period", () => {
    expect(applyExpenseFilters(records, { method: "io", type: "essential" }).map((r) => r.description)).toEqual(["Netflix"]);
    expect(applyExpenseFilters(records, { status: "paid" }).map((r) => r.description)).toEqual(["Laptop"]);
    expect(applyExpenseFilters(records, { period: "monthly", category: "fun" })).toHaveLength(1);
  });

  it("should tell purchases in installments and shared expenses apart", () => {
    expect(applyExpenseFilters(records, { installments: "with" }).map((r) => r.description)).toEqual(["Laptop"]);
    expect(applyExpenseFilters(records, { installments: "without" }).map((r) => r.description)).toEqual(["Netflix", "Almuerzo"]);
    expect(applyExpenseFilters(records, { shared: "yes" }).map((r) => r.description)).toEqual(["Netflix"]);
    expect(applyExpenseFilters(records, { shared: "no" })).toHaveLength(2);
  });

  it("should show only the default person until another one (or everyone) is chosen (D80)", () => {
    const people = [
      { description: "Mío", personId: "me" },
      { description: "De Danery", personId: "danery" },
    ];
    expect(applyExpenseFilters(people, {}, "me").map((r) => r.description)).toEqual(["Mío"]);
    expect(applyExpenseFilters(people, { person: "all" }, "me")).toHaveLength(2);
    expect(applyExpenseFilters(people, { person: "danery" }, "me").map((r) => r.description)).toEqual(["De Danery"]);
  });

  it("should know when a filter is on", () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ q: "" })).toBe(false);
    expect(hasActiveFilters({ category: "fun" })).toBe(true);
  });
});
