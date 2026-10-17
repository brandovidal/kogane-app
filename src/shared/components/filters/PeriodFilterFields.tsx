import { MonthYearPicker } from "@/shared/components/navigation/MonthYearPicker";
import type { MonthlyPeriod } from "@/shared/types/period";

export interface PeriodFilterFieldsProps {
  value: MonthlyPeriod;
  onChange: (period: MonthlyPeriod) => void;
}

/** Compact period selector intended for the Día a día page header. */
export function PeriodFilterFields({ value, onChange }: PeriodFilterFieldsProps) {
  return <MonthYearPicker value={value} ariaLabel="Período de Día a día" className="w-[190px]" onChange={onChange} />;
}
