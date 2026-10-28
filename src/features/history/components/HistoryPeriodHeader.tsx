import { FixedCostPeriodSelector } from '@/features/fixed-costs/components/header/FixedCostPeriodSelector'
import { PERIOD_YEAR_MAX, PERIOD_YEAR_MIN } from '@/shared/constants/period'
import { useUrlPeriod } from '@/shared/hooks/useUrlPeriod'
import { usePeriod } from '@/shared/stores/period.store'

export function HistoryPeriodHeader() {
  useUrlPeriod({ minYear: PERIOD_YEAR_MIN, maxYear: PERIOD_YEAR_MAX })
  const month = usePeriod((state) => state.month)
  const year = usePeriod((state) => state.year)
  const setPeriod = usePeriod((state) => state.setPeriod)

  return (
    <FixedCostPeriodSelector
      value={{ month, year }}
      onChange={({ month: nextMonth, year: nextYear }) => setPeriod(nextMonth, nextYear)}
      modes={['month']}
      showPresets={false}
    />
  )
}
