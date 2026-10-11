import type { ExpenseFilterKey } from "@/features/expenses/types/expense-filters";

export const DAILY_FILTERS: ExpenseFilterKey[] = [
  "q",
  "person",
  "category",
  "method",
  "currency",
  "type",
  "shared",
  "origin",
  "amountFrom",
  "amountTo",
];

/** Filters shown in the panel and applied-filter summary (search is separate). */
export const DAILY_PANEL_FILTER_KEYS = DAILY_FILTERS.filter(
  (key) => key !== "q",
);

export const DAILY_LAYOUTS = [
  { value: "list", label: "Lista" },
  { value: "day", label: "Por día" },
  { value: "calendar", label: "Calendario" },
] as const;

export const DAILY_SORT_OPTIONS = [
  { value: "date-desc", label: "Fecha · más reciente" },
  { value: "date-asc", label: "Fecha · más antigua" },
  { value: "amount-desc", label: "Monto · mayor primero" },
  { value: "amount-asc", label: "Monto · menor primero" },
  { value: "description-asc", label: "Descripción · A–Z" },
] as const;

export type DailySort = (typeof DAILY_SORT_OPTIONS)[number]["value"];

export type DailyLayout = (typeof DAILY_LAYOUTS)[number]["value"];
