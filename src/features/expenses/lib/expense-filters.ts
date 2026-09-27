import { PERSON_ALL, PERSON_ME, INSTALLMENT_FILTER, SHARED_FILTER, PANEL_FILTER_KEYS, PANEL_FILTER_THRESHOLD } from "../constants/expense-filters";
import type { ExpenseFilterValues, ExpenseFilterKey, FilterableExpense } from "../types/expense-filters";

// Compatibility exports for existing consumers; definitions live in constants/types.
export { PERSON_ALL, PERSON_ME, PANEL_FILTER_KEYS } from "../constants/expense-filters";
export type { ExpenseFilterValues, ExpenseFilterKey, FilterableExpense } from "../types/expense-filters";

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

// `me`: the default person's id, selected through PERSON_ME ("Yo").
export function applyExpenseFilters<T extends FilterableExpense>(
  records: T[],
  filters: ExpenseFilterValues,
  me?: string,
): T[] {
  const q = filters.q?.trim() ? fold(filters.q.trim()) : null;
  const person = !filters.person || filters.person === PERSON_ALL
    ? null
    : filters.person === PERSON_ME ? me ?? null : filters.person;
  const dueFrom = filters.dueFrom || null;
  const dueTo = filters.dueTo || null;
  return records.filter(
    (record) =>
      (!person || record.personId === person) &&
      (!q || [record.description, record.merchant, record.notes].some((text) => text && fold(text).includes(q))) &&
      (!filters.category || record.categoryId === filters.category) &&
      (!filters.method || record.paymentMethodId === filters.method) &&
      (!filters.currency || record.currency === filters.currency) &&
      (!filters.type || record.expenseType === filters.type) &&
      (!filters.status || record.paymentStatus === filters.status) &&
      (!filters.period || record.period === filters.period) &&
      (!filters.installments || hasInstallments(record.installment) === (filters.installments === INSTALLMENT_FILTER.WITH)) &&
      (!filters.shared || (record.othersShare ?? 0) > 0 === (filters.shared === SHARED_FILTER.SHARED)) &&
      (!(dueFrom || dueTo) || !!record.dueDate) &&
      (!dueFrom || (record.dueDate?.slice(0, 10) ?? "") >= dueFrom) &&
      (!dueTo || (record.dueDate?.slice(0, 10) ?? "") <= dueTo),
  );
}

export const hasActiveFilters = (filters: ExpenseFilterValues) =>
  Object.values(filters).some((value) => value != null && value !== "");

// Larger sets of filters use the sheet instead of inline controls.
export const usesPanel = (fields: ExpenseFilterKey[]) =>
  fields.filter((key) => PANEL_FILTER_KEYS.includes(key)).length > PANEL_FILTER_THRESHOLD;

// How many of the filters of the panel are on (the N of the button)
export const activePanelCount = (filters: ExpenseFilterValues, fields: ExpenseFilterKey[]) =>
  PANEL_FILTER_KEYS.filter((key) => fields.includes(key) && filters[key] != null && filters[key] !== "").length;
