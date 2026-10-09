import type { CreditCardExpense, PaymentMethod } from "@/shared/api/types";

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
