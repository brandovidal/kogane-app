import { MonthYearPicker } from "@/shared/components/navigation/MonthYearPicker";
import { usePeriod } from "@/shared/stores/period.store";

export function CardPeriodSelector() {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const setPeriod = usePeriod((state) => state.setPeriod);
  return (
    <MonthYearPicker
      value={{ month, year }}
      onChange={({ month: nextMonth, year: nextYear }) =>
        setPeriod(nextMonth, nextYear)
      }
      ariaLabel="Período de tarjetas"
      className="w-auto min-w-40"
    />
  );
}
