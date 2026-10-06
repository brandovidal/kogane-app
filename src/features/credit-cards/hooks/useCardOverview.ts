import { useEffect, useMemo } from "react";
import { useCreditCards, useMe, usePeople, nameById } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { applyExpenseFilters } from "@/features/expenses/lib/expense-filters";
import { isPaidStatus } from "@/features/expenses/lib/expense-actions";
import { totalsOf } from "@/features/expenses/lib/shared-expense";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { usePeriod } from "@/shared/stores/period.store";
import { EXPENSE_RESOURCES, type CreditCardExpense, type PaymentMethod } from "@/shared/api/types";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { cardHref } from "../lib/card-links";
import { cardHeaderStore } from "../stores/card-header.store";

export interface CardOverviewRow {
  card: PaymentMethod;
  href: string;
  expenses: CreditCardExpense[];
  total: number;
  pending: number;
  count: number;
  closeDay: number | null;
  payDay: number | null;
}

const FILTER_KEYS = ["person", "q", "installments", "category", "currency", "status", "type", "shared"] as const;
const EMPTY_EXPENSES: CreditCardExpense[] = [];
const EMPTY_CARDS: PaymentMethod[] = [];

export function useCardOverview() {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const cardsQuery = useCreditCards();
  const expensesQuery = useExpenses(EXPENSE_RESOURCES.creditCard, { month, year });
  const cards = cardsQuery.data ?? EMPTY_CARDS;
  const expenses = expensesQuery.data ?? EMPTY_EXPENSES;
  const people = usePeople().data;
  const personName = nameById(people);
  const me = useMe();
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>([...FILTER_KEYS]);
  const filtered = useMemo(() => applyExpenseFilters(expenses, filters, me), [expenses, filters, me]);
  const rows = useMemo<CardOverviewRow[]>(() => cards.map((card) => {
    const ofCard = filtered.filter((expense) => expense.paymentMethodId === card.id);
    return {
      card,
      href: cardHref(card.code ?? card.id),
      expenses: ofCard,
      total: totalsOf(ofCard).paid,
      pending: totalsOf(ofCard.filter((expense) => !isPaidStatus(expense.paymentStatus))).paid,
      count: ofCard.length,
      closeDay: card.billingCloseDay,
      payDay: card.paymentDueDay,
    };
  }), [cards, filtered]);
  useEffect(() => cardHeaderStore.getState().setCount(cardsQuery.isLoading ? null : cards.length), [cards.length, cardsQuery.isLoading]);
  return {
    month, year, cards, expenses, filtered, rows, filters, setFilters, personName,
    total: rows.reduce((sum, row) => sum + row.total, 0),
    loading: cardsQuery.isLoading || expensesQuery.isLoading,
    error: cardsQuery.isError || expensesQuery.isError,
  };
}
