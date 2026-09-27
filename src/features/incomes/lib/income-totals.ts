import type { Income } from "../hooks/budget";

export function incomeTotals(incomes: readonly Income[]) {
  return incomes.reduce(
    (totals, income) => {
      if (income.currency === "PEN") totals.pen += income.amount;
      if (income.currency === "USD") totals.usd += income.amount;
      return totals;
    },
    { pen: 0, usd: 0 },
  );
}
