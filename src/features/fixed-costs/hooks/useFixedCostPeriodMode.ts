type PeriodValues = {
  month?: string;
  year?: string;
  desde?: string;
  hasta?: string;
};

type PeriodMode = "month" | "year" | "range" | "all";
type PeriodScope = "month" | "year";

/** Derives the selected period mode from URL values and the active view scope. */
export function useFixedCostPeriodMode(
  values: PeriodValues,
  scope: PeriodScope,
): PeriodMode {
  if (scope === "year") return "year";
  if (values.desde || values.hasta) return "range";
  if (values.month && values.year) return "month";
  if (values.year) return "year";
  return "all";
}
