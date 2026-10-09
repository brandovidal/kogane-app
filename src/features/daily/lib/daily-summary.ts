import type { DailyExpense } from "@/shared/api/types";

export type CurrencyTotals = Partial<Record<"PEN" | "USD", number>>;

const key = (currency: string): "PEN" | "USD" =>
  currency === "USD" ? "USD" : "PEN";

export interface DailySummary {
  count: number;
  total: CurrencyTotals;
  /** Soles per elapsed day of the month. */
  dailyAverage: number;
  elapsedDays: number;
  biggest: DailyExpense | null;
  today: { count: number; total: number };
}

/** Days of the month that count for the average: all of a closed month, up to today in the current one. */
export function elapsedDays(month: number, year: number, now: Date): number {
  const inMonth = new Date(year, month, 0).getDate();
  const selected = year * 12 + month;
  const current = now.getFullYear() * 12 + now.getMonth() + 1;
  if (selected < current) return inMonth;
  if (selected > current) return 0;
  return Math.min(now.getDate(), inMonth);
}

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function summarizeDaily(
  expenses: DailyExpense[],
  month: number,
  year: number,
  now: Date = new Date(),
): DailySummary {
  const total: CurrencyTotals = {};
  let totalPen = 0;
  let biggest: DailyExpense | null = null;
  const today = { count: 0, total: 0 };
  const todayKey = dayKey(now);
  for (const expense of expenses) {
    const pen = expense.amountInPen ?? expense.amount;
    total[key(expense.currency)] =
      (total[key(expense.currency)] ?? 0) + expense.amount;
    totalPen += pen;
    if (!biggest || pen > (biggest.amountInPen ?? biggest.amount))
      biggest = expense;
    if (expense.spentAt.slice(0, 10) === todayKey) {
      today.count += 1;
      today.total += pen;
    }
  }
  const days = elapsedDays(month, year, now);
  return {
    count: expenses.length,
    total,
    dailyAverage: days > 0 ? totalPen / days : 0,
    elapsedDays: days,
    biggest,
    today,
  };
}
