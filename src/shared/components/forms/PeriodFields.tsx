import { useId } from "react";
import { CalendarDays, CalendarRange } from "lucide-react";
import {
  PERIOD_MONTH_OPTIONS,
  PERIOD_YEAR_OPTIONS,
} from "@/shared/constants/period";
import { FormField } from "@/shared/components/forms/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import type { MonthlyPeriod } from "@/shared/types/period";

export interface PeriodFieldsProps {
  value: MonthlyPeriod;
  onChange: (period: MonthlyPeriod) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function PeriodFields({
  value: { month, year },
  onChange,
  disabled,
  ariaLabel = "Período del registro",
}: PeriodFieldsProps) {
  const id = useId();
  return (
    <div className="grid grid-cols-2 gap-3" role="group" aria-label={ariaLabel}>
      <FormField label="Mes" icon={CalendarDays} htmlFor={`${id}-month`}>
        <Select
          value={String(month)}
          onValueChange={(next) => onChange({ month: Number(next), year })}
          disabled={disabled}
        >
          <SelectTrigger
            id={`${id}-month`}
            className="w-full"
            aria-label={`Mes: ${ariaLabel}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_MONTH_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Año" icon={CalendarRange} htmlFor={`${id}-year`}>
        <Select
          value={String(year)}
          onValueChange={(next) => onChange({ month, year: Number(next) })}
          disabled={disabled}
        >
          <SelectTrigger
            id={`${id}-year`}
            className="w-full"
            aria-label={`Año: ${ariaLabel}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_YEAR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}
