import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type {
  ExpenseFilterKey,
  ExpenseFilterValues,
} from "@/features/expenses/types/expense-filters";

export function countPlatformFilters(
  filters: ExpenseFilterValues,
  fields: readonly ExpenseFilterKey[],
) {
  const hasDueDateField =
    fields.includes("dueFrom") || fields.includes("dueTo");
  const hasAmountField =
    fields.includes("amountFrom") || fields.includes("amountTo");
  const fieldsWithoutRanges = fields.filter(
    (field) =>
      field !== "dueFrom" &&
      field !== "dueTo" &&
      field !== "amountFrom" &&
      field !== "amountTo",
  );
  const dueDateCount =
    hasDueDateField && (filters.dueFrom || filters.dueTo) ? 1 : 0;
  const amountCount =
    hasAmountField && (filters.amountFrom || filters.amountTo) ? 1 : 0;

  return (
    countActiveExpenseFilters(filters, fieldsWithoutRanges) +
    dueDateCount +
    amountCount
  );
}
