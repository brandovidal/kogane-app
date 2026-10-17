import { RecordSearchField } from '@/shared/components/filters/RecordSearchField'
import { FilterSheetShell } from '@/shared/components/filters/FilterSheetShell'
import { MoreFilters } from '@/shared/components/filters/MoreFilters'
import { MonthYearPicker } from '@/shared/components/navigation/MonthYearPicker'
import type { MonthlyPeriod } from '@/shared/types/period'
import { Button } from '@/ui/button'
import { SheetDescription, SheetTitle } from '@/ui/sheet'
import { Trash2 } from 'lucide-react'
import { ExpenseFilterFields } from '@/features/expenses/components/filters/ExpenseFilterFields'
import { countActiveExpenseFilters } from '@/features/expenses/lib/expense-filters'
import type { ExpenseFilterValues } from '@/features/expenses/types/expense-filters'
import { DAILY_PANEL_FILTER_KEYS } from '../../constants/daily'

const PRIMARY_FIELDS = ['person', 'category'] as const
const ADDITIONAL_FIELDS = DAILY_PANEL_FILTER_KEYS.filter((field) => !PRIMARY_FIELDS.includes(field as (typeof PRIMARY_FIELDS)[number]))

export function DailyFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  period,
  onPeriodChange,
  shown,
  total,
  filterCount,
  onClear,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ExpenseFilterValues
  onFiltersChange: (filters: ExpenseFilterValues) => void
  period: MonthlyPeriod
  onPeriodChange: (period: MonthlyPeriod) => void
  shown: number
  total: number
  filterCount: number
  onClear: () => void
}) {
  const additionalCount = countActiveExpenseFilters(filters, ADDITIONAL_FIELDS)

  return (
    <FilterSheetShell
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="w-[min(26rem,calc(100vw-1rem))] gap-0 p-0"
      headerClassName="gap-2 border-b p-5 pr-12"
      bodyClassName="space-y-5 p-5"
      footerClassName="flex-row items-center justify-between border-t bg-background p-4"
      header={
        <>
          <SheetTitle className="flex items-center gap-2">
            Filtros
            {(filterCount > 0 || period) && (
              <span className="rounded-full bg-brand/15 px-2 text-xs font-semibold text-brand">{filterCount + (period ? 1 : 0)}</span>
            )}
          </SheetTitle>
          <SheetDescription>
            Mostrando {shown} de {total} gastos
          </SheetDescription>
        </>
      }
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" disabled={filterCount === 0} onClick={onClear}>
            <Trash2 className="size-4" />
            Limpiar todo
          </Button>
          <Button type="button" size="sm" className="h-9 px-4" onClick={() => onOpenChange(false)}>
            Ver {shown} {shown === 1 ? 'resultado' : 'resultados'}
          </Button>
        </>
      }
    >
      <RecordSearchField value={filters.q ?? ''} onChange={(q) => onFiltersChange({ ...filters, q: q || undefined })} className="w-full sm:hidden" />

      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          {period && <span aria-hidden="true" className="size-2 rounded-full bg-brand" />}
          Fecha
        </h3>
        <MonthYearPicker value={period} onChange={onPeriodChange} ariaLabel="Período de Día a día" />
      </section>

      <ExpenseFilterFields
        fields={[...PRIMARY_FIELDS]}
        value={filters}
        onChange={onFiltersChange}
        panel
        personInPanel
        activeMarkers
        showIcons={false}
      />

      <MoreFilters activeCount={additionalCount} activeCountDisplay="inline" defaultOpen>
        <ExpenseFilterFields
          fields={ADDITIONAL_FIELDS}
          value={filters}
          onChange={onFiltersChange}
          panel
          activeMarkers
          showIcons={false}
          wrapAdditionalFilters={false}
        />
      </MoreFilters>
    </FilterSheetShell>
  )
}
