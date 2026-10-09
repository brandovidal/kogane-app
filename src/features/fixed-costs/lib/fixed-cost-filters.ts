import type { ExpenseFilterKey } from "@/features/expenses/types/expense-filters";
import type { FixedCostGroupField } from "@/features/fixed-costs/types/fixed-cost-types";

export const FIXED_COST_FILTER_KEYS: ExpenseFilterKey[] = [
  "month",
  "year",
  "q",
  "status",
  "category",
  "method",
  "currency",
  "type",
  "shared",
  "dueFrom",
  "dueTo",
];

const PERIOD_KEYS = new Set<ExpenseFilterKey>(["month", "year"]);
export const FIXED_COST_PANEL_FILTER_KEYS = FIXED_COST_FILTER_KEYS.filter(
  (key) => !PERIOD_KEYS.has(key) && key !== "q",
);

export const FIXED_COST_GROUP_OPTIONS = [
  { value: "person", label: "Por persona" },
  { value: "category", label: "Por categoría" },
];

export const FIXED_COST_GROUP_LABELS: Record<FixedCostGroupField, string> = {
  person: "Por persona",
  category: "Por categoría",
};
