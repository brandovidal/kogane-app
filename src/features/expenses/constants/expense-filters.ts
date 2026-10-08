import { CURRENCY_OPTIONS } from "@/shared/constants/currency";
import type { ExpenseFilterKey } from "../types/expense-filters";

export const PERSON_ALL = "all";
export const PERSON_ME = "__me__";
export const PERSON_UNASSIGNED = "__unassigned__";
export const PERSON_FILTER_LABELS = { ALL: "Todos", ME: "Yo" } as const;

export const INSTALLMENT_FILTER = { WITH: "with", WITHOUT: "without" } as const;
export const SHARED_FILTER = { SHARED: "yes", OWN: "no" } as const;

export const INSTALLMENT_FILTER_OPTIONS = [
  { value: INSTALLMENT_FILTER.WITH, label: "Con cuota" },
  { value: INSTALLMENT_FILTER.WITHOUT, label: "Sin cuota" },
];
export const SHARED_FILTER_OPTIONS = [
  { value: SHARED_FILTER.SHARED, label: "Compartidos" },
  { value: SHARED_FILTER.OWN, label: "Solo míos" },
];
export const CURRENCY_FILTER_OPTIONS = [...CURRENCY_OPTIONS];

export const PANEL_FILTER_KEYS: ExpenseFilterKey[] = [
  "category",
  "method",
  "currency",
  "type",
  "status",
  "period",
  "shared",
  "dueFrom",
  "dueTo",
  "month",
  "year",
];
export const PANEL_FILTER_THRESHOLD = 3;

export const PRIMARY_PANEL_FILTER_KEYS: readonly ExpenseFilterKey[] = [
  "month",
  "year",
  "person",
  "category",
  "status",
];
