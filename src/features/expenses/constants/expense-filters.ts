import { CURRENCY_OPTIONS } from "@/shared/constants/currency";
import {
  SHARED_FILTER,
  SHARED_FILTER_OPTIONS,
} from "@/shared/constants/expense-filters";
import {
  PERSON_ALL,
  PERSON_FILTER_LABELS,
  PERSON_ME,
  PERSON_UNASSIGNED,
} from "@/shared/constants/person-filter";
import type { ExpenseFilterKey } from "../types/expense-filters";

export { PERSON_ALL, PERSON_FILTER_LABELS, PERSON_ME, PERSON_UNASSIGNED };

export const INSTALLMENT_FILTER = { WITH: "with", WITHOUT: "without" } as const;
export const INSTALLMENT_FILTER_OPTIONS = [
  { value: INSTALLMENT_FILTER.WITH, label: "Con cuota" },
  { value: INSTALLMENT_FILTER.WITHOUT, label: "Sin cuota" },
];
export { SHARED_FILTER, SHARED_FILTER_OPTIONS };
export const CURRENCY_FILTER_OPTIONS = [...CURRENCY_OPTIONS];

export const PANEL_FILTER_KEYS: ExpenseFilterKey[] = [
  "category",
  "method",
  "currency",
  "type",
  "status",
  "period",
  "shared",
  "hasNote",
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

export const PRIMARY_FIELDS = PRIMARY_PANEL_FILTER_KEYS.filter(
  (field) => field === "person" || field === "category",
);

export const ADDITIONAL_FIELDS = PANEL_FILTER_KEYS.filter(
  (field) =>
    field !== "category" &&
    field !== "status" &&
    field !== "period" &&
    field !== "month" &&
    field !== "year",
);
