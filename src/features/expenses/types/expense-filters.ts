import type { INSTALLMENT_FILTER, SHARED_FILTER } from "../constants/expense-filters";

export type InstallmentFilterValue = (typeof INSTALLMENT_FILTER)[keyof typeof INSTALLMENT_FILTER];
export type SharedFilterValue = (typeof SHARED_FILTER)[keyof typeof SHARED_FILTER];

export interface ExpenseFilterValues {
  person?: string; // Empty or PERSON_ALL = everyone, PERSON_ME = default person, or a person's id.
  q?: string;
  category?: string;
  method?: string;
  currency?: string;
  type?: string;
  status?: string;
  period?: string;
  installments?: InstallmentFilterValue;
  shared?: SharedFilterValue;
  dueFrom?: string;
  dueTo?: string;
}

export type ExpenseFilterKey = keyof ExpenseFilterValues;

export interface FilterableExpense {
  description: string;
  personId?: string | null;
  merchant?: string | null;
  notes?: string | null;
  categoryId?: string | null;
  paymentMethodId?: string | null;
  currency?: string | null;
  expenseType?: string | null;
  paymentStatus?: string | null;
  period?: string | null;
  installment?: string | null;
  othersShare?: number | null;
  dueDate?: string | null;
}
