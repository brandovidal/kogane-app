import { CalendarDays, CalendarRange } from "lucide-react";
import {
  PERIOD_MONTH_OPTIONS,
  PERIOD_YEAR_OPTIONS,
} from "@/shared/constants/period";
import { FilterSelect } from "./FilterSelect";

export interface PeriodFilterFieldsProps {
  month?: string;
  year?: string;
  showMonth?: boolean;
  showYear?: boolean;
  activeMarker?: boolean;
  onMonthChange: (month: string | undefined) => void;
  onYearChange: (year: string | undefined) => void;
}

export function PeriodFilterFields({
  month,
  year,
  showMonth = true,
  showYear = true,
  activeMarker = true,
  onMonthChange,
  onYearChange,
}: PeriodFilterFieldsProps) {
  const years =
    year && !PERIOD_YEAR_OPTIONS.some((option) => option.value === year)
      ? [{ value: year, label: year }, ...PERIOD_YEAR_OPTIONS]
      : PERIOD_YEAR_OPTIONS;

  return (
    <section
      className="-mx-2 space-y-3 rounded-lg border py-2.5 px-2"
      aria-label="Período del registro"
    >
      <div
        className={
          showMonth && showYear
            ? "grid grid-cols-2 gap-3"
            : "grid grid-cols-1 gap-3"
        }
      >
        {showMonth && (
          <FilterSelect
            label="Mes"
            icon={CalendarDays}
            value={month}
            options={PERIOD_MONTH_OPTIONS}
            onChange={onMonthChange}
            activeMarker={activeMarker}
            width="w-full"
            searchable
            labelClassName="text-sm font-medium"
          />
        )}
        {showYear && (
          <FilterSelect
            label="Año"
            icon={CalendarRange}
            value={year}
            options={years}
            onChange={onYearChange}
            activeMarker={activeMarker}
            width="w-full"
            searchable
            labelClassName="text-sm font-medium"
          />
        )}
      </div>
    </section>
  );
}
