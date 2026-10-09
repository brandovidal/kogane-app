import { FixedCostPeriodSelector } from "@/features/fixed-costs/components/header/FixedCostPeriodSelector";
import { usePeriod } from "@/shared/stores/period.store";

export function PlatformPeriodSelector() {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  return (
    <FixedCostPeriodSelector
      defaultValue={{ month, year }}
      showPresets={false}
    />
  );
}
