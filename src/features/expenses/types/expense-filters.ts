import type {
  INSTALLMENT_FILTER,
  SHARED_FILTER,
} from "../constants/expense-filters";

export type InstallmentFilterValue =
  (typeof INSTALLMENT_FILTER)[keyof typeof INSTALLMENT_FILTER];
export type SharedFilterValue =
  (typeof SHARED_FILTER)[keyof typeof SHARED_FILTER];

export interface ExpenseFilterValues {
  person?: string; // Comma-separated person ids; PERSON_ME and PERSON_UNASSIGNED are special values.
  q?: string;
  category?: string;
  method?: string; // Comma-separated payment method ids; no value means all active methods.
  currency?: string;
  type?: string;
  status?: string;
  period?: string;
  installments?: InstallmentFilterValue;
  shared?: SharedFilterValue;
  dueFrom?: string;
  dueTo?: string;
  hasNote?: "yes" | "no";
  amountFrom?: string;
  amountTo?: string;
  methodType?: string;
  month?: string;
  year?: string;
}

export type ExpenseFilterKey = keyof ExpenseFilterValues;

export interface FilterableExpense {
  description: string;
  personId?: string | null;
  merchant?: string | null;
  notes?: string | null;
  categoryId?: string | null;
  paymentMethodId?: string | null;
  amount?: number;
  amountInPen?: number | null;
  currency?: string | null;
  expenseType?: string | null;
  paymentStatus?: string | null;
  period?: string | null;
  installment?: string | null;
  othersShare?: number | null;
  dueDate?: string | null;
  paymentMonth?: number | null;
  paymentYear?: number | null;
}
