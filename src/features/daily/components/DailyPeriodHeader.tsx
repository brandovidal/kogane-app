import { PeriodFilterFields } from "@/shared/components/filters/PeriodFilterFields";
import { usePeriod } from "@/shared/stores/period.store";

/** Month and year control displayed in the application header for Día a día. */
export function DailyPeriodHeader() {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const setPeriod = usePeriod((state) => state.setPeriod);

  return (
    <PeriodFilterFields
      value={{ month, year }}
      onChange={(period) => setPeriod(period.month, period.year)}
    />
  );
}
