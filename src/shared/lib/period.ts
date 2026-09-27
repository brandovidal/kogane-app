import { PERIOD_YEAR_MIN, PERIOD_YEAR_MAX } from "@/shared/constants/period";
import type { MonthlyPeriod } from "@/shared/types/period";

export function periodFromParams(
  params: URLSearchParams,
  fallback: MonthlyPeriod,
): MonthlyPeriod {
  const month = Number(params.get("month"));
  const year = Number(params.get("year"));
  return {
    month:
      Number.isInteger(month) && month >= 1 && month <= 12
        ? month
        : fallback.month,
    year:
      Number.isInteger(year) &&
      year >= PERIOD_YEAR_MIN &&
      year <= PERIOD_YEAR_MAX
        ? year
        : fallback.year,
  };
}
