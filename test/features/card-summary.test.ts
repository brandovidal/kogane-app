import { describe, expect, it } from "vitest";
import {
  cardTotal,
  latestMovements,
  lineUsage,
  topCategories,
} from "@/features/credit-cards/lib/card-summary";
import type { CreditCardExpense } from "@/shared/api/types";

const expense = (over: Partial<CreditCardExpense>) =>
  ({
    id: "x",
    amount: 10,
    amountInPen: null,
    processDate: "2026-09-01",
    categoryId: null,
    ...over,
  }) as CreditCardExpense;

const list = [
  expense({
    id: "a",
    amount: 100,
    processDate: "2026-09-03",
    categoryId: "c1",
  }),
  expense({ id: "b", amount: 50, processDate: "2026-09-12", categoryId: "c1" }),
  expense({ id: "c", amount: 300, processDate: "2026-09-08" }),
  expense({
    id: "d",
    amount: 20,
    amountInPen: 75,
    processDate: "2026-09-05",
    categoryId: "c2",
  }),
];

describe("card summary", () => {
  it("computes line usage", () => {
    expect(lineUsage(2033.49, 8000)).toBe(25);
    expect(lineUsage(9000, 8000)).toBe(100);
    expect(lineUsage(10, null)).toBeNull();
    expect(lineUsage(10, 0)).toBeNull();
  });
  it("returns the latest movements first", () => {
    expect(latestMovements(list, 2).map((e) => e.id)).toEqual(["b", "c"]);
  });
  it("ranks categories, using the amount in soles", () => {
    const top = topCategories(list, (id) => id ?? "Sin categoría", 2);
    expect(top).toEqual([
      { id: "none", name: "Sin categoría", total: 300 },
      { id: "c1", name: "c1", total: 150 },
    ]);
  });
  it("totals in soles", () => {
    expect(cardTotal(list)).toBe(525);
  });
});
