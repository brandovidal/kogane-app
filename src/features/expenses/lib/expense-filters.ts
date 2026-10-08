import {
  PERSON_ALL,
  PERSON_ME,
  PERSON_UNASSIGNED,
  INSTALLMENT_FILTER,
  SHARED_FILTER,
  PANEL_FILTER_KEYS,
  PANEL_FILTER_THRESHOLD,
} from "../constants/expense-filters";
import type {
  ExpenseFilterValues,
  ExpenseFilterKey,
  FilterableExpense,
} from "../types/expense-filters";

// Compatibility exports for existing consumers; definitions live in constants/types.
export {
  PERSON_ALL,
  PERSON_ME,
  PANEL_FILTER_KEYS,
} from "../constants/expense-filters";
export type {
  ExpenseFilterValues,
  ExpenseFilterKey,
  FilterableExpense,
} from "../types/expense-filters";

const fold = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

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
  const selectedPeople = filters.person
    ?.split(",")
    .filter((person) => person && person !== PERSON_ALL)
    .map((person) => (person === PERSON_ME ? me : person))
    .filter((person): person is string => !!person);
  const dueFrom = filters.dueFrom || null;
  const dueTo = filters.dueTo || null;
  const categories = filters.category?.split(",").filter(Boolean) ?? [];
  return records.filter(
    (record) =>
      (!selectedPeople?.length || selectedPeople.some((person) =>
        person === PERSON_UNASSIGNED ? !record.personId : record.personId === person,
      )) &&
      (!q ||
        [record.description, record.merchant, record.notes].some(
          (text) => text && fold(text).includes(q),
        )) &&
      (!categories.length || categories.includes(record.categoryId ?? "")) &&
      (!filters.method || record.paymentMethodId === filters.method) &&
      (!filters.currency || record.currency === filters.currency) &&
      (!filters.type || record.expenseType === filters.type) &&
      (!filters.status || record.paymentStatus === filters.status) &&
      (!filters.period || record.period === filters.period) &&
      (!filters.month || record.paymentMonth === Number(filters.month)) &&
      (!filters.year || record.paymentYear === Number(filters.year)) &&
      (!filters.installments ||
        hasInstallments(record.installment) ===
          (filters.installments === INSTALLMENT_FILTER.WITH)) &&
      (!filters.shared ||
        (record.othersShare ?? 0) > 0 ===
          (filters.shared === SHARED_FILTER.SHARED)) &&
      (!(dueFrom || dueTo) || !!record.dueDate) &&
      (!dueFrom || (record.dueDate?.slice(0, 10) ?? "") >= dueFrom) &&
      (!dueTo || (record.dueDate?.slice(0, 10) ?? "") <= dueTo),
  );
}

export const hasActiveFilters = (filters: ExpenseFilterValues) =>
  Object.values(filters).some((value) => value != null && value !== "");

export function countActiveExpenseFilters(
  filters: ExpenseFilterValues,
  fields: readonly ExpenseFilterKey[],
) {
  return fields.filter((key) => {
    const value = filters[key];
    if (value == null || value === "") return false;
    if (key === "q") return !!value.trim();
    if (key === "person") return value !== PERSON_ALL;
    return true;
  }).length;
}

// Larger sets of filters use the sheet instead of inline controls.
export const usesPanel = (fields: ExpenseFilterKey[]) =>
  fields.filter((key) => PANEL_FILTER_KEYS.includes(key)).length >
  PANEL_FILTER_THRESHOLD;

// How many of the filters of the panel are on (the N of the button)
export const activePanelCount = (
  filters: ExpenseFilterValues,
  fields: ExpenseFilterKey[],
) =>
  PANEL_FILTER_KEYS.filter(
    (key) =>
      fields.includes(key) && filters[key] != null && filters[key] !== "",
  ).length;
