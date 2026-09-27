import type { ExpenseFilterKey } from "@/features/expenses/types/expense-filters";
import type { FixedCostGroupBy } from "@/features/fixed-costs/types/fixed-cost-types";

export const FIXED_COST_FILTER_KEYS: ExpenseFilterKey[] = [
  "person", "q", "status", "category", "method", "currency", "type", "shared", "dueFrom", "dueTo",
];

export const FIXED_COST_GROUP_OPTIONS = [
  { value: "person", label: "Por persona" },
  { value: "category", label: "Por categoría" },
];

export const FIXED_COST_GROUP_LABELS: Record<FixedCostGroupBy, string> = {
  none: "",
  person: "Por persona",
  category: "Por categoría",
};
