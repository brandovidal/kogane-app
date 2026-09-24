// Filters of the expense pages (D79): a pure function over the month already loaded, so totals follow what is shown

export interface ExpenseFilterValues {
  person?: string; // D71, D80: empty = the default person ("Yo"), "all" = everyone, or one person's id
  q?: string; // concept, merchant or note
  category?: string;
  method?: string; // payment method id
  type?: string; // essential · guilty_pleasure
  status?: string; // payment status
  period?: string; // subscriptions
  installments?: "with" | "without"; // cards: bought in installments or not
  shared?: "yes" | "no"; // D73: someone owes a part
}

export type ExpenseFilterKey = keyof ExpenseFilterValues;

export const PERSON_ALL = "all";

export const EXPENSE_FILTER_KEYS: ExpenseFilterKey[] = [
  "person",
  "q",
  "category",
  "method",
  "type",
  "status",
  "period",
  "installments",
  "shared",
];

export interface FilterableExpense {
  description: string;
  personId?: string | null;
  merchant?: string | null;
  notes?: string | null;
  categoryId?: string | null;
  paymentMethodId?: string | null;
  expenseType?: string | null;
  paymentStatus?: string | null;
  period?: string | null;
  installment?: string | null;
  othersShare?: number | null;
}

const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// A multi-installment purchase: "1/10", "3/6" (not "1/1")
const hasInstallments = (installment: string | null | undefined) => {
  const total = Number(installment?.split("/")[1] ?? 0);
  return total > 1;
};

// `me`: the default person, what "Yo" means while the person filter is empty
export function applyExpenseFilters<T extends FilterableExpense>(
  records: T[],
  filters: ExpenseFilterValues,
  me?: string,
): T[] {
  const q = filters.q?.trim() ? fold(filters.q.trim()) : null;
  const person = filters.person === PERSON_ALL ? null : (filters.person ?? me ?? null);
  return records.filter(
    (record) =>
      (!person || record.personId === person) &&
      (!q || [record.description, record.merchant, record.notes].some((text) => text && fold(text).includes(q))) &&
      (!filters.category || record.categoryId === filters.category) &&
      (!filters.method || record.paymentMethodId === filters.method) &&
      (!filters.type || record.expenseType === filters.type) &&
      (!filters.status || record.paymentStatus === filters.status) &&
      (!filters.period || record.period === filters.period) &&
      (!filters.installments || hasInstallments(record.installment) === (filters.installments === "with")) &&
      (!filters.shared || (record.othersShare ?? 0) > 0 === (filters.shared === "yes")),
  );
}

export const hasActiveFilters = (filters: ExpenseFilterValues) =>
  Object.values(filters).some((value) => value != null && value !== "");
