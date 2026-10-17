import { Download, Upload } from 'lucide-react'
import { useState } from 'react'

import { DailyIndicators } from '../components/DailyIndicators'
import { DailyViewBar } from '../sections/list/DailyViewBar'
import { DailyResultsSection } from '../sections/list/DailyResultsSection'
import { useDailyActions } from '../hooks/useDailyActions'
import { useDailyList } from '../hooks/useDailyList'
import { createDailyExpenseColumns } from '../lib/daily-columns'
import { ExpenseEditDialog } from '@/features/expenses/components/ExpenseEditDialog'
import { OriginMessageDialog } from '@/features/drafts/components/OriginMessageDialog'
import { ImportListDialog } from '@/features/imports/components/ImportListDialog'
import { useCsvExport } from '@/shared/hooks/useCsvExport'
import { BulkActionsToolbar } from '@/shared/components/toolbar/BulkActionsToolbar'
import { withQuery } from '@/shared/api/query'
import { EXPENSE_RESOURCES } from '@/shared/api/types'
import { DailyToolbar } from '../sections/list/DailyToolbar'
import { periodStore } from '@/shared/stores/period.store'
import { countActiveExpenseFilters } from '@/features/expenses/lib/expense-filters'
import { DAILY_FILTERS } from '../constants/daily'
import { Button } from '@/ui/button'

function DailyListPageContent() {
  const list = useDailyList()
  const actions = useDailyActions()
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])

  const columns = createDailyExpenseColumns({
    categories: list.categories,
    methodName: list.methodName,
    personName: list.personName,
    onEdit: actions.setEditing,
    onOrigin: actions.setOrigin,
    onDuplicate: actions.onDuplicate,
    onDelete: actions.onDelete,
  })
  const csvHeaders = ['Descripción', 'Fecha', 'Monto', 'Moneda', 'Medio de pago', 'Persona', 'Categoría', 'Origen']
  const csvRows = (expenses: typeof list.sorted) =>
    expenses.map((expense) => [
      expense.description,
      expense.spentAt.slice(0, 10),
      expense.amount,
      expense.currency,
      list.methodName(expense.paymentMethodId),
      list.personName(expense.personId),
      list.categoryName(expense.categoryId),
      expense.draftId ? 'Mensaje' : 'Manual',
    ])
  const csv = useCsvExport({
    filename: `dia-a-dia-${list.year}-${String(list.month).padStart(2, '0')}`,
    headers: csvHeaders,
    rows: csvRows(list.sorted),
  })
  const selectedCsv = useCsvExport({
    filename: `dia-a-dia-seleccion-${list.year}-${String(list.month).padStart(2, '0')}`,
    headers: csvHeaders,
    rows: csvRows(list.sorted.filter((expense) => list.selected.has(expense.id))),
  })
  const exportItems = [
    ...csv.items,
    {
      label: 'Importar lista',
      icon: <Upload aria-hidden="true" />,
      onSelect: () => actions.setImporting(true),
    },
  ]

  const visibleColumns = columns.filter((column) => column.key === 'actions' || !hiddenColumns.includes(column.key))
  const columnOptions = columns
    .filter((column) => column.key !== 'actions')
    .map((column) => ({
      id: column.key,
      label: column.header,
      visible: !hiddenColumns.includes(column.key),
      disabled:
        !hiddenColumns.includes(column.key) && columns.filter((item) => item.key !== 'actions' && !hiddenColumns.includes(item.key)).length <= 1,
      onVisibleChange: (visible: boolean) =>
        setHiddenColumns((current) =>
          visible ? current.filter((key) => key !== column.key) : current.includes(column.key) ? current : [...current, column.key],
        ),
    }))
  const resetView = () => {
    list.setFilters({})
    list.setGroupBy('none')
    list.setSort('date-desc')
    list.setLayout('list')
    list.setHideEmpty(true)
    list.setView('table')
    setHiddenColumns([])
  }

  if (list.isLoading) return null

  return (
    <div className="space-y-4">
      <DailyViewBar layout={list.layout} onLayoutChange={list.setLayout} exportItems={exportItems} />

      <DailyIndicators
        expenses={list.sorted}
        month={list.month}
        year={list.year}
        filtered={countActiveExpenseFilters(list.filters, DAILY_FILTERS) > 0}
      />

      <DailyToolbar
        filters={list.filters}
        onFiltersChange={list.setFilters}
        me={list.me}
        shown={list.sorted.length}
        total={list.expenses.length}
        groupBy={list.groupBy}
        onGroupByChange={(next) => {
          list.setGroupBy(next)
          if (list.layout === 'day') list.setLayout('list')
        }}
        hideEmptyGroups={list.hideEmpty}
        onHideEmptyGroupsChange={list.setHideEmpty}
        groupOptions={
          list.layout === 'calendar'
            ? undefined
            : [
                { value: 'day', label: 'Por día' },
                { value: 'person', label: 'Por persona' },
                { value: 'category', label: 'Por categoría' },
              ]
        }
        view={list.view}
        onViewChange={list.setView}
        columns={columnOptions}
        sort={list.sort}
        onSortChange={list.setSort}
        period={{ month: list.month, year: list.year }}
        onPeriodChange={({ month, year }) => {
          periodStore.getState().setPeriod(month, year)
        }}
        onReset={resetView}
      />

      <BulkActionsToolbar count={list.selected.size} onClear={() => list.setSelected(new Set())}>
        <Button type="button" size="sm" variant="outline" onClick={selectedCsv.exportCsv}>
          <Download aria-hidden="true" /> Exportar selección
        </Button>
      </BulkActionsToolbar>

      <DailyResultsSection
        expenses={list.sorted}
        totalExpenses={list.expenses.length}
        loading={list.isLoading}
        personIds={list.people.map((person) => person.id)}
        categories={list.categories}
        personName={list.personName}
        categoryName={list.categoryName}
        columns={visibleColumns}
        view={list.view}
        groupBy={list.groupBy}
        hideEmptyGroups={list.hideEmpty}
        layout={list.layout}
        year={list.year}
        month={list.month}
        today={list.today}
        onEdit={actions.setEditing}
        onNewExpense={() => actions.openNewExpense({ destination: 'daily' })}
        selected={list.selected}
        onSelectedChange={list.setSelected}
      />

      {actions.origin?.draftId && (
        <OriginMessageDialog draftId={actions.origin.draftId} title={actions.origin.description} onClose={() => actions.setOrigin(undefined)} />
      )}

      <ImportListDialog open={actions.importing} onOpenChange={actions.setImporting} target="daily-expenses" title="Importar gastos del día a día" />

      <ExpenseEditDialog
        open={!!actions.editing}
        onOpenChange={(open) => !open && actions.setEditing(undefined)}
        resource={EXPENSE_RESOURCES.daily}
        expense={actions.editing}
      />
    </div>
  )
}

export const DailyListPage = withQuery(DailyListPageContent)
