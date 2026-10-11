import { useMemo } from "react";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { useDebts } from "@/features/debts/hooks/debts";
import { useSummary } from "@/features/budget/hooks/summary";
import {
  EXPENSE_RESOURCES,
  type CreditCardExpense,
  type Debt,
  type FixedCost,
} from "@/shared/api/types";
import { nextMonthForecast } from "../lib/next-month-forecast";

const EMPTY_FIXED_COSTS: FixedCost[] = [];
const EMPTY_CARD_EXPENSES: CreditCardExpense[] = [];
const EMPTY_DEBTS: Debt[] = [];

export function useNextMonthForecast(month: number, year: number) {
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const summaryQuery = useSummary(nextMonth, nextYear);
  const fixedCostsQuery = useExpenses(EXPENSE_RESOURCES.fixedCost, {
    month: nextMonth,
    year: nextYear,
  });
  const cardExpensesQuery = useExpenses(EXPENSE_RESOURCES.creditCard, {
    month: nextMonth,
    year: nextYear,
  });
  const debtsQuery = useDebts();
  const summary = summaryQuery.data;
  const fixedCostsData = fixedCostsQuery.data;
  const cardExpensesData = cardExpensesQuery.data;
  const debtsData = debtsQuery.data;
  const fixedCosts = fixedCostsData ?? EMPTY_FIXED_COSTS;
  const cardExpenses = cardExpensesData ?? EMPTY_CARD_EXPENSES;
  const debts = debtsData ?? EMPTY_DEBTS;
  const forecast = useMemo(
    () =>
      nextMonthForecast({
        summary,
        fixedCosts,
        cardExpenses,
        debts,
        month: nextMonth,
        year: nextYear,
      }),
    [summary, fixedCosts, cardExpenses, debts, nextMonth, nextYear],
  );
  return {
    month: nextMonth,
    year: nextYear,
    ...forecast,
    isLoading:
      summaryQuery.isPending ||
      fixedCostsQuery.isPending ||
      cardExpensesQuery.isPending ||
      debtsQuery.isPending,
    isError:
      summaryQuery.isError ||
      fixedCostsQuery.isError ||
      cardExpensesQuery.isError ||
      debtsQuery.isError,
    retry: () => {
      void summaryQuery.refetch();
      void fixedCostsQuery.refetch();
      void cardExpensesQuery.refetch();
      void debtsQuery.refetch();
    },
  };
}
