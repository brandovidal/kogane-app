import type { ExpenseFilterKey } from "@/features/expenses/types/expense-filters";

export const DAILY_FILTERS: ExpenseFilterKey[] = [
  "q",
  "category",
  "method",
  "currency",
  "type",
  "shared",
];

export const DAILY_LAYOUTS = [
  { value: "list", label: "Lista" },
  { value: "day", label: "Por día" },
  { value: "calendar", label: "Calendario" },
] as const;

export type DailyLayout = (typeof DAILY_LAYOUTS)[number]["value"];
