import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { buildCreditCardSummaries } from "../services/dashboard.service";

export function useCreditCardSummaries(month: number, year: number) {
  const cards = useCreditCards().data ?? [];
  const cardExpenses =
    useExpenses(EXPENSE_RESOURCES.creditCard, { month, year }).data ?? [];
  return buildCreditCardSummaries(cards, cardExpenses);
}
