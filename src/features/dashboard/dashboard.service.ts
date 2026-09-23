import { useQueries } from "@tanstack/react-query";

import { api, unwrap } from "@/shared/api/client";
import { useCategories, useCreditCards } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/shared/api/hooks/expenses";
import { summaryKeys, useSummary } from "@/shared/api/hooks/summary";
import {
  EXPENSE_RESOURCES,
  type Category,
  type CreditCardExpense,
  type PaymentMethod,
  type Summary,
} from "@/shared/api/types";

export interface DashboardSummary {
  totalExpenses: number;
  totalFixedCosts: number;
  totalSubscriptions: number;
  totalCreditCards: number;
  salary: number;
  surplus: number;
  totalNecesario: number;
  totalConCulpa: number;
}

export interface CategoryBreakdown {
  name: string;
  color: string;
  amount: number;
}

export interface CreditCardSummary {
  code: string;
  name: string;
  color: string | null;
  total: number;
  billingCloseDay: number;
  paymentDueDay: number;
}

interface Spending {
  amount: number;
  amountInPen: number | null;
  expenseType: string;
  categoryId: string | null;
}

const penOf = (item: { amount: number; amountInPen: number | null }) => item.amountInPen ?? item.amount;
const sum = <T>(items: T[], value: (item: T) => number) => items.reduce((total, item) => total + value(item), 0);

// Totals of /v1/summary (soles) by destination, and essential vs guilty pleasure from the records of the month
export function buildDashboardSummary(summary: Summary | undefined, records: Spending[]): DashboardSummary {
  const totalOf = (destination: string) =>
    sum(summary?.totals.filter((row) => row.destination === destination && row.currency === "PEN") ?? [], (row) => row.total);
  const salary = summary?.budget?.salary ?? 0;
  const totalExpenses = summary?.spentPen ?? 0;

  return {
    totalExpenses,
    totalFixedCosts: totalOf("fixed_cost"),
    totalSubscriptions: totalOf("subscription"),
    totalCreditCards: totalOf("credit_card"),
    salary,
    surplus: summary?.surplus ?? salary - totalExpenses,
    totalNecesario: sum(records.filter((item) => item.expenseType === "essential"), penOf),
    totalConCulpa: sum(records.filter((item) => item.expenseType === "guilty_pleasure"), penOf),
  };
}

export function buildCategoryBreakdown(categories: Category[], records: Spending[]): CategoryBreakdown[] {
  return categories
    .map((category) => ({
      name: category.name,
      color: category.color,
      amount: sum(records.filter((item) => item.categoryId === category.id), penOf),
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function buildCreditCardSummaries(cards: PaymentMethod[], expenses: CreditCardExpense[]): CreditCardSummary[] {
  return cards.map((card) => ({
    code: card.code ?? card.name,
    name: card.name,
    color: card.color,
    billingCloseDay: card.billingCloseDay ?? 0,
    paymentDueDay: card.paymentDueDay ?? 0,
    total: sum(expenses.filter((expense) => expense.paymentMethodId === card.id), penOf),
  }));
}

// The months before `month/year`, oldest first
export function lastMonths(month: number, year: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const offset = year * 12 + (month - 1) - (count - 1 - index);
    return { month: (offset % 12) + 1, year: Math.floor(offset / 12) };
  });
}

// Subscriptions stay out of the spending records (D46: the card expense is the real charge)
export function useDashboard(month: number, year: number) {
  const period = { month, year };
  const summary = useSummary(month, year).data;
  const categories = useCategories().data ?? [];
  const cards = useCreditCards().data ?? [];
  const daily = useExpenses(EXPENSE_RESOURCES.daily, period).data ?? [];
  const fixedCosts = useExpenses(EXPENSE_RESOURCES.fixedCost, period).data ?? [];
  const cardExpenses = useExpenses(EXPENSE_RESOURCES.creditCard, period).data ?? [];
  const records = [...daily, ...fixedCosts, ...cardExpenses];

  const trendMonths = lastMonths(month, year, 6);
  const trend = useQueries({
    queries: trendMonths.map((item) => ({
      queryKey: summaryKeys.month(item.month, item.year),
      queryFn: () => unwrap(api.GET("/v1/summary", { params: { query: item } })),
    })),
  });

  return {
    summary: buildDashboardSummary(summary, records),
    categories: buildCategoryBreakdown(categories, records),
    creditCards: buildCreditCardSummaries(cards, cardExpenses),
    trend: trendMonths.map((item, index) => {
      const data = trend[index].data;
      const salary = data?.budget?.salary ?? 0;
      const totalExpenses = data?.spentPen ?? 0;
      return { ...item, totalExpenses, salary, surplus: data?.surplus ?? salary - totalExpenses };
    }),
  };
}
