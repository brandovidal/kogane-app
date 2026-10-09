import type { CreditCardExpense } from "@/shared/api/types";

const amountOf = (expense: CreditCardExpense) =>
  expense.amountInPen ?? expense.amount;

/** Share of the credit line used, 0–100; null without a line. */
export function lineUsage(
  used: number,
  limit: number | null | undefined,
): number | null {
  if (!limit || limit <= 0) return null;
  return Math.min(100, Math.round((used / limit) * 100));
}

/** The `count` most recent movements by process date, newest first. */
export function latestMovements(
  expenses: CreditCardExpense[],
  count = 5,
): CreditCardExpense[] {
  return [...expenses]
    .sort((a, b) => (b.processDate ?? "").localeCompare(a.processDate ?? ""))
    .slice(0, count);
}

export interface CategoryShare {
  id: string;
  name: string;
  total: number;
}

/** Biggest categories of the cycle, `Sin categoría` included. */
export function topCategories(
  expenses: CreditCardExpense[],
  nameOf: (id: string | null) => string,
  count = 3,
): CategoryShare[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    const key = expense.categoryId ?? "none";
    totals.set(key, (totals.get(key) ?? 0) + amountOf(expense));
  }
  return [...totals]
    .map(([id, total]) => ({
      id,
      name: nameOf(id === "none" ? null : id),
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, count);
}

export const cardTotal = (expenses: CreditCardExpense[]) =>
  expenses.reduce((sum, expense) => sum + amountOf(expense), 0);
