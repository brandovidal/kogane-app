import { CalendarDays, CalendarRange } from "lucide-react";
import {
  PERIOD_MONTH_OPTIONS,
  PERIOD_YEAR_OPTIONS,
} from "@/shared/constants/period";
import { FilterSelect } from "./FilterSelect";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";

export interface PeriodFilterFieldsProps {
  compact?: boolean;
  month?: string;
  year?: string;
  showMonth?: boolean;
  showYear?: boolean;
  onMonthChange: (month: string | undefined) => void;
  onYearChange: (year: string | undefined) => void;
}

export function PeriodFilterFields({
  compact = false,
  month,
  year,
  showMonth = true,
  showYear = true,
  onMonthChange,
  onYearChange,
}: PeriodFilterFieldsProps) {
  // A shared URL can also contain a valid year outside the usual form range.
  const years =
    year && !PERIOD_YEAR_OPTIONS.some((option) => option.value === year)
      ? [{ value: year, label: year }, ...PERIOD_YEAR_OPTIONS]
      : PERIOD_YEAR_OPTIONS;

  return (
    <section
      className={compact ? "min-w-0" : "space-y-3 rounded-lg border p-3"}
      aria-label="Período del registro"
    >
      {!compact && (
        <div className="text-sm font-medium">
          <FieldLabel icon={CalendarRange}>Período del registro</FieldLabel>
        </div>
      )}
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
            width="w-full"
            searchable
            labelClassName={
              compact
                ? "text-xs font-medium text-muted-foreground"
                : "text-sm font-medium"
            }
          />
        )}
        {showYear && (
          <FilterSelect
            label="Año"
            icon={CalendarRange}
            value={year}
            options={years}
            onChange={onYearChange}
            width="w-full"
            searchable
            labelClassName={
              compact
                ? "text-xs font-medium text-muted-foreground"
                : "text-sm font-medium"
            }
          />
        )}
      </div>
    </section>
  );
}
