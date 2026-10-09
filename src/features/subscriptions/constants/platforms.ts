import type { ExpenseFilterKey } from "@/features/expenses/types/expense-filters";

export const PLATFORM_FILTER_KEYS: ExpenseFilterKey[] = [
  "person",
  "q",
  "category",
  "method",
  "status",
  "type",
  "currency",
  "shared",
  "hasNote",
  "amountFrom",
  "amountTo",
  "methodType",
];

export const PLATFORM_SHEET_FILTER_KEYS = PLATFORM_FILTER_KEYS.filter(
  (key) => key !== "q",
);

export const PLATFORM_MORE_FILTER_KEYS = PLATFORM_FILTER_KEYS.filter(
  (key) => !["person", "q", "method", "status"].includes(key),
);

export const VIEW_PERIOD_KEYS = ["month", "year", "desde", "hasta"] as const;

export const PLATFORM_PERIOD_COLORS: Record<string, string> = {
  biweekly: "bg-orange-500/15 text-orange-400",
  monthly: "bg-indigo-400/15 text-indigo-300",
  quarterly: "bg-violet-400/15 text-violet-300",
  semiannual: "bg-emerald-400/15 text-emerald-300",
  annual: "bg-amber-400/15 text-amber-300",
};
