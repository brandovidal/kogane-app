import { useState } from 'react'
import { LayoutGrid, List, LoaderCircle, Plus } from 'lucide-react'
import { useDeleteIncome, useIncomes, type Income } from '../hooks/budget'
import { IncomeDialog } from './IncomeDialog'
import { incomeColumns } from '../lib/income-columns'
import { incomeTotals } from '../lib/income-totals'
import { IncomeSummarySection } from '../sections/IncomeSummarySection'
import { useSummary } from '@/features/budget/hooks/summary'
import { SalaryDialog } from '@/features/budget/components/dialogs/SalaryDialog'
import { withQuery } from '@/shared/api/query'
import { EmptyState } from '@/shared/components/data-display/EmptyState'
import { DataView } from '@/shared/components/data-display/DataView'
import { DeleteConfirmationDialog } from '@/shared/components/dialogs/DeleteConfirmationDialog'
import { usePeriod } from '@/shared/stores/period.store'
import type { MonthlyPeriod } from '@/shared/types/period'
import { Button } from '@/ui/button'

function IncomesPageView() {
  const month = usePeriod((state) => state.month)
  const year = usePeriod((state) => state.year)
  const setPeriod = usePeriod((state) => state.setPeriod)
  const changePeriod = (period: MonthlyPeriod) => setPeriod(period.month, period.year)
  const query = useIncomes(month, year)
  const summary = useSummary(month, year)
  const incomes = query.data ?? []
  const deleteIncome = useDeleteIncome()
  const [editing, setEditing] = useState<Income | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<Income | null>(null)
  const [salaryOpen, setSalaryOpen] = useState(false)
  const [view, setView] = useState<'list' | 'cards'>('list')
  const columns = incomeColumns({
    onEdit: setEditing,
    onDelete: setDeleting,
    deleting: deleteIncome.isPending,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border bg-card p-1" role="group" aria-label="Vista de ingresos">
            <button
              type="button"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
              className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium ${view === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="size-4" />
              Lista
            </button>
            <button
              type="button"
              aria-pressed={view === 'cards'}
              onClick={() => setView('cards')}
              className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium ${view === 'cards' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="size-4" />
              Tarjetas
            </button>
          </div>
          <Button size="sm" onClick={() => setEditing(null)}>
            <Plus aria-hidden="true" />
            Nuevo ingreso extra
          </Button>
        </div>
      </div>

      {summary.isPending && (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Cargando sueldo del mes…
        </p>
      )}
      {summary.isError && (
        <div role="alert" className="flex flex-wrap items-center gap-2 text-sm">
          <p>No se pudo cargar el sueldo del mes.</p>
          <Button size="sm" variant="outline" onClick={() => summary.refetch()}>
            Reintentar
          </Button>
        </div>
      )}
      <IncomeSummarySection
        budget={summary.isError ? undefined : summary.data?.budget}
        totals={query.data && !query.isError ? incomeTotals(incomes) : undefined}
        onEditSalary={() => setSalaryOpen(true)}
      />

      <section className="space-y-4" aria-labelledby="extra-incomes-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="extra-incomes-title" className="text-base font-semibold">
              Ingresos extra
            </h2>
            {query.data && !query.isError && <p className="text-xs text-muted-foreground">{incomes.length} registros en este mes</p>}
          </div>
        </div>
        {query.isPending ? (
          <p role="status" className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Cargando ingresos extra…
          </p>
        ) : query.isError ? (
          <div role="alert" className="space-y-3 rounded-lg border p-4 text-sm">
            <p>No se pudieron cargar los ingresos extra.</p>
            <Button size="sm" variant="outline" onClick={() => query.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : incomes.length === 0 ? (
          <EmptyState description="No hay ingresos extra en este mes" />
        ) : (
          <DataView items={incomes} columns={columns} rowKey={(income) => income.id} view={view === 'list' ? 'table' : 'cards'} />
        )}
      </section>

      {editing !== undefined && (
        <IncomeDialog income={editing} period={{ month, year }} onClose={() => setEditing(undefined)} onSaved={changePeriod} />
      )}
      {salaryOpen && <SalaryDialog open onOpenChange={setSalaryOpen} initialPeriod={{ month, year }} onSaved={changePeriod} />}
      <DeleteConfirmationDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="Eliminar ingreso"
        description={<>Se eliminará «{deleting?.description}» y se actualizará el total de su mes. Esta acción no se puede deshacer.</>}
        pending={deleteIncome.isPending}
        onConfirm={() => {
          if (deleting)
            deleteIncome.mutate(deleting.id, {
              onSuccess: () => setDeleting(null),
            })
        }}
      />
    </div>
  )
}

export const IncomesPage = withQuery(IncomesPageView)
