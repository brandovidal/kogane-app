import { getMonthName } from "@/shared/lib/dates";

export const PERIOD_YEAR_MIN = 2020;
export const PERIOD_YEAR_MAX = 2100;
export const PERIOD_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: getMonthName(index + 1),
}));
export const PERIOD_YEAR_OPTIONS = Array.from(
  { length: PERIOD_YEAR_MAX - PERIOD_YEAR_MIN + 1 },
  (_, index) => ({
    value: String(PERIOD_YEAR_MAX - index),
    label: String(PERIOD_YEAR_MAX - index),
  }),
);
