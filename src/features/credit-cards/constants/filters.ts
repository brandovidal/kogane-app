import type { ExpenseFilterKey } from "@/features/expenses/types/expense-filters";

export const CARD_OVERVIEW_FILTER_KEYS = [
  "person",
  "q",
  "installments",
  "category",
  "currency",
  "status",
  "type",
  "shared",
] as const satisfies readonly ExpenseFilterKey[];

export const CARD_DETAIL_FILTER_KEYS = [
  "person",
  "q",
  "category",
  "currency",
  "status",
  "installments",
  "type",
  "shared",
] as const satisfies readonly ExpenseFilterKey[];

export const CARD_DETAIL_GROUP_OPTIONS = [
  { value: "category", label: "Categoría" },
  { value: "currency", label: "Moneda" },
  { value: "person", label: "Persona" },
  { value: "installments", label: "Cuotas" },
] as const;

export type CardDetailGroupBy =
  (typeof CARD_DETAIL_GROUP_OPTIONS)[number]["value"];
