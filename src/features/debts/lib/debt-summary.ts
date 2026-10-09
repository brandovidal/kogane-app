import type { Debt } from "@/shared/api/types";

export type CurrencyTotals = Partial<Record<"PEN" | "USD", number>>;

const key = (currency: string): "PEN" | "USD" =>
  currency === "USD" ? "USD" : "PEN";

function add(totals: CurrencyTotals, currency: string, value: number) {
  totals[key(currency)] = (totals[key(currency)] ?? 0) + value;
}

/** Soles per unit of the debt's own currency (1 for PEN). */
const penFactor = (debt: Debt) =>
  debt.amount > 0 && debt.amountInPen != null
    ? debt.amountInPen / debt.amount
    : 1;

export interface DebtSummary {
  count: number;
  balance: CurrencyTotals;
  paid: CurrencyTotals;
  late: CurrencyTotals;
  lateCount: number;
  /** Paid share of the month in soles, 0–100. */
  paidPercent: number;
  largest: { debt: Debt; sharePercent: number } | null;
}

/** Indicators of Cobros / Deudas: what is left, what is paid, what is late and the biggest balance. */
export function summarizeDebts(debts: Debt[]): DebtSummary {
  const balance: CurrencyTotals = {};
  const paid: CurrencyTotals = {};
  const late: CurrencyTotals = {};
  let lateCount = 0;
  let paidPen = 0;
  let totalPen = 0;
  let largest: Debt | null = null;
  for (const debt of debts) {
    add(balance, debt.currency, debt.balance);
    add(paid, debt.currency, debt.paidAmount);
    if (debt.timing === "late" && debt.balance > 0) {
      add(late, debt.currency, debt.balance);
      lateCount += 1;
    }
    paidPen += debt.paidAmount * penFactor(debt);
    totalPen += debt.amount * penFactor(debt);
    if (
      debt.balance > 0 &&
      (!largest ||
        debt.balance * penFactor(debt) > largest.balance * penFactor(largest))
    )
      largest = debt;
  }
  const largestShare = largest
    ? Math.round(
        (largest.balance / (balance[key(largest.currency)] || 1)) * 100,
      )
    : 0;
  return {
    count: debts.length,
    balance,
    paid,
    late,
    lateCount,
    paidPercent: totalPen > 0 ? Math.round((paidPen / totalPen) * 100) : 0,
    largest: largest ? { debt: largest, sharePercent: largestShare } : null,
  };
}
