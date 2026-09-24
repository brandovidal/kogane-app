import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/shared/api/hooks/expenses";
import { EXPENSE_RESOURCES, type CreditCardExpense, type PaymentMethod } from "@/shared/api/types";

// Inicio: the budget comes from /v1/summary (BudgetKpis, BudgetDonut, BudgetVsActual, SurplusTrend, D78); here only
// the cards of the month, for the billing cycle card

export interface CreditCardSummary {
  code: string;
  name: string;
  color: string | null;
  total: number;
  billingCloseDay: number;
  paymentDueDay: number;
}

const penOf = (item: { amount: number; amountInPen: number | null }) => item.amountInPen ?? item.amount;

export function buildCreditCardSummaries(cards: PaymentMethod[], expenses: CreditCardExpense[]): CreditCardSummary[] {
  return cards.map((card) => ({
    code: card.code ?? card.name,
    name: card.name,
    color: card.color,
    billingCloseDay: card.billingCloseDay ?? 0,
    paymentDueDay: card.paymentDueDay ?? 0,
    total: expenses.filter((expense) => expense.paymentMethodId === card.id).reduce((sum, expense) => sum + penOf(expense), 0),
  }));
}

export function useCreditCardSummaries(month: number, year: number) {
  const cards = useCreditCards().data ?? [];
  const cardExpenses = useExpenses(EXPENSE_RESOURCES.creditCard, { month, year }).data ?? [];
  return buildCreditCardSummaries(cards, cardExpenses);
}
