import { useMemo, useState } from 'react'
import { Gauge, Pencil, Plus, SlidersHorizontal } from 'lucide-react'

import { BudgetGroupDialog } from '@/features/budget-groups/components/BudgetGroupDialog'
import { useBudgetGroupSummaries } from '@/features/budget-groups/hooks/useBudgetGroupSummaries'
import { CategoryDialog } from '@/features/categories/components/CategoryDialog'
import { CategoryIcon } from '@/features/categories/components/CategoryIcon'
import { CategoryLimitDialog } from '@/features/categories/components/CategoryLimitDialog'
import { useCategoryBudgets } from '@/features/categories/hooks/category-budgets'
import { useSummary } from '@/features/budget/hooks/summary'
import { SalaryDialog } from '@/features/budget/components/dialogs/SalaryDialog'
import { useCategories } from '@/shared/api/hooks/catalogs'
import type { BudgetGroup, Category } from '@/shared/api/types'
import { formatCurrency } from '@/shared/lib/currency'
import { usePeriod } from '@/shared/stores/period.store'
import { Button } from '@/ui/button'
import { Progress } from '@/ui/progress'
import { BudgetSwitches } from './BudgetSwitches'
import { STATUS_TEXT } from '../lib/budget-view'
import { buildOverview, type OverviewCategory, type OverviewGroup } from '../lib/budget-overview'
import { useSetBudget } from '@/features/budget/hooks/summary'
import { BudgetAllocationBar } from './BudgetAllocationBar'
import { BudgetSetupSection } from './BudgetSetupSection'

type BudgetView = 'list' | 'table' | 'cards'
type Grouping = 'group' | 'none'
type CategoryFilter = 'all' | 'limited' | 'attention' | 'unlimited'
const GROUP_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

function Stat({
  label,
  value,
  hint,
  action,
  valueClassName = '',
}: {
  label: string
  value: string
  hint: string
  action?: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        {action}
      </p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function UsageBar({ category }: { category: OverviewCategory }) {
  if (category.limit == null) return <span className="text-xs text-muted-foreground">Sin límite</span>
  return (
    <div className="flex min-w-24 items-center gap-2">
      <Progress
        value={Math.min(category.percent, 100)}
        className={`h-1.5 flex-1 ${category.status === 'over' ? '[&>div]:bg-destructive' : category.status === 'warning' ? '[&>div]:bg-amber-400' : ''}`}
      />
      <span className={`min-w-8 text-right text-xs tabular-nums ${STATUS_TEXT[category.status]}`}>{category.percent} %</span>
    </div>
  )
}

// Presupuesto ▸ Resumen: connects monthly income, group allocation and category limits.
export function BudgetOverview() {
  const month = usePeriod((s) => s.month)
  const year = usePeriod((s) => s.year)
  const summaryQuery = useSummary(month, year)
  const summary = summaryQuery.data
  const { summaries } = useBudgetGroupSummaries(month, year)
  const lines = useCategoryBudgets(month, year).data ?? []
  const categories = useCategories().data ?? []
  const [view, setView] = useState<BudgetView>('list')
  const [grouping, setGrouping] = useState<Grouping>('group')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [salaryOpen, setSalaryOpen] = useState(false)
  const [groupDialog, setGroupDialog] = useState<{ open: boolean; group?: BudgetGroup }>({ open: false })
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; category?: Category }>({ open: false })
  const [limitOf, setLimitOf] = useState<OverviewCategory | null>(null)
  const previousIndex = year * 12 + month - 2
  const previousMonth = (previousIndex % 12) + 1
  const previousYear = Math.floor(previousIndex / 12)
  const previousSummary = useSummary(previousMonth, previousYear, !summaryQuery.isPending && (!summary?.budget || !!summary.budget.isProposal))
  const copyBudget = useSetBudget()

  const { groups, totals } = buildOverview(summaries, lines)
  const budget = summary?.budget
  const salary = budget?.salary ?? 0
  const groupOf = (id: string) => summaries.find((s) => s.group.id === id)?.group
  const categoryOf = (id: string) => categories.find((c) => c.id === id)
  const assignedPercent = groups.reduce((sum, g) => sum + g.percentage, 0)
  const spendingTotal = totals.spent
  const availableTotal = salary + (summary?.extraIncome ?? 0) - spendingTotal
  const limitUsePercent = budget?.limit ? Math.round((spendingTotal / budget.limit) * 100) : 0
  const showGroupColumn = grouping === 'none' || view === 'table'
  const categoryGridClass = showGroupColumn
    ? 'grid-cols-[minmax(180px,1.5fr)_minmax(110px,0.8fr)_110px_110px_minmax(130px,1fr)_110px_72px]'
    : 'grid-cols-[minmax(180px,1.5fr)_110px_110px_minmax(130px,1fr)_110px_72px]'
  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          categories: group.categories.filter((category) => {
            const matchesSearch = category.name.toLowerCase().includes(search.trim().toLowerCase())
            const matchesFilter =
              filter === 'all' ||
              (filter === 'limited' && category.limit != null) ||
              (filter === 'unlimited' && category.limit == null) ||
              (filter === 'attention' && category.status !== 'ok')
            return matchesSearch && matchesFilter
          }),
        }))
        .filter((group) => group.categories.length > 0 || (!search && filter === 'all')),
    [groups, search, filter],
  )

  const categoryRow = (category: OverviewCategory, group?: OverviewGroup) => (
    <div key={category.id} className={`grid min-w-[760px] ${categoryGridClass} items-center gap-3 border-t px-4 py-2.5 text-sm`}>
      <span className="flex min-w-0 items-center gap-2">
        <CategoryIcon icon={category.icon} color={category.color} size="sm" />
        <span className="truncate">{category.name}</span>
      </span>
      {showGroupColumn && <span className="truncate text-xs text-muted-foreground">{group ? `${group.emoji} ${group.name}` : '—'}</span>}
      <span className="text-right tabular-nums">
        {category.limit != null ? (
          formatCurrency(category.limit)
        ) : (
          <button type="button" className="text-primary hover:underline" onClick={() => setLimitOf(category)}>
            Poner límite
          </button>
        )}
      </span>
      <span className="text-right tabular-nums">{formatCurrency(category.spent)}</span>
      <UsageBar category={category} />
      <span
        className={`text-right text-xs tabular-nums ${category.limit != null && category.limit - category.spent < 0 ? 'text-destructive' : 'text-emerald-400'}`}
      >
        {category.limit == null ? '—' : formatCurrency(category.limit - category.spent)}
      </span>
      <span className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`Editar ${category.name}`}
          onClick={() => setCategoryDialog({ open: true, category: categoryOf(category.id) })}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7" aria-label={`Límite de ${category.name}`} onClick={() => setLimitOf(category)}>
          <Gauge className="size-3.5" />
        </Button>
      </span>
    </div>
  )

  const categoryCard = (category: OverviewCategory) => (
    <article key={category.id} className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <CategoryIcon icon={category.icon} color={category.color} size="sm" />
        <h3 className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`Editar ${category.name}`}
          onClick={() => setCategoryDialog({ open: true, category: categoryOf(category.id) })}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">Gastado</p>
          <p className="mt-1 font-semibold tabular-nums">{formatCurrency(category.spent)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Límite</p>
          <p className="mt-1 font-semibold tabular-nums">
            {category.limit != null ? (
              formatCurrency(category.limit)
            ) : (
              <button type="button" className="text-primary hover:underline" onClick={() => setLimitOf(category)}>
                Poner límite
              </button>
            )}
          </p>
        </div>
      </div>
      <UsageBar category={category} />
    </article>
  )

  const groupBlock = (group: OverviewGroup, index: number) => (
    <section key={group.id} className="min-w-[760px] overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-muted/35 px-4 py-3">
        <p className="min-w-36 flex-1 font-semibold">
          <span className="mr-2 inline-block size-2 rounded-sm" style={{ backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }} />
          {group.name}
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">{group.percentage} %</span>
        </p>
        <p className="text-right text-sm font-semibold tabular-nums">
          {formatCurrency(group.spent)}
          <span className="block text-[10px] font-normal text-muted-foreground">gastado</span>
        </p>
        <p className="text-right text-sm font-semibold tabular-nums">
          {formatCurrency(group.assigned)}
          <span className="block text-[10px] font-normal text-muted-foreground">asignado</span>
        </p>
        <p className={`min-w-32 text-sm font-semibold tabular-nums ${group.available < 0 ? 'text-destructive' : 'text-emerald-400'}`}>
          {formatCurrency(group.available)} <span className="text-[10px] font-normal text-muted-foreground">disponible</span>
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`Editar ${group.name}`}
          onClick={() => setGroupDialog({ open: true, group: groupOf(group.id) })}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
      {group.categories.length === 0 ? (
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">Sin categorías en este grupo.</p>
      ) : view === 'cards' ? (
        <div className="grid gap-2 p-3 sm:grid-cols-2">{group.categories.map(categoryCard)}</div>
      ) : (
        group.categories.map((category) => categoryRow(category, grouping === 'group' ? group : undefined))
      )}
    </section>
  )

  if (!summaryQuery.isPending && !summaryQuery.isError && (!budget || budget.isProposal)) {
    const previousBudget = previousSummary.data?.budget
    return (
      <>
        <BudgetSetupSection
          month={month}
          year={year}
          salary={salary}
          proposal={!!budget?.isProposal}
          onCreate={() => setSalaryOpen(true)}
          canCopy={!!previousBudget}
          copying={copyBudget.isPending}
          onCopy={() =>
            previousBudget && copyBudget.mutate({ month, year, salary: previousBudget.salary, limitPercent: previousBudget.limitPercent })
          }
        />
        {salaryOpen && <SalaryDialog open onOpenChange={setSalaryOpen} initialPeriod={{ month, year }} onSaved={() => setSalaryOpen(false)} />}
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border bg-card p-1" aria-label="Modo de vista">
            {(['list', 'table', 'cards'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={view === mode}
                onClick={() => setView(mode)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${view === mode ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {mode === 'list' ? 'Lista' : mode === 'table' ? 'Tabla' : 'Tarjetas'}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border bg-card p-1" aria-label="Agrupar categorías">
            <button
              type="button"
              aria-pressed={grouping === 'group'}
              onClick={() => setGrouping('group')}
              className={`rounded-md px-3 py-1.5 text-xs ${grouping === 'group' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            >
              Por grupo
            </button>
            <button
              type="button"
              aria-pressed={grouping === 'none'}
              onClick={() => setGrouping('none')}
              className={`rounded-md px-3 py-1.5 text-xs ${grouping === 'none' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            >
              Sin agrupar
            </button>
          </div>
          <Button size="sm" variant={filterOpen ? 'secondary' : 'outline'} onClick={() => setFilterOpen((open) => !open)}>
            <SlidersHorizontal className="size-4" />
            Filtros
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCategoryDialog({ open: true })}>
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        </div>
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setGroupDialog({ open: true })}>
          <Plus className="size-4" />
          Nuevo grupo
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Sueldo mensual"
          value={formatCurrency(salary)}
          hint={`+ ${formatCurrency(summary?.extraIncome ?? 0)} de ingresos extra · ${assignedPercent} % asignado`}
          action={
            <button className="text-xs hover:text-foreground" onClick={() => setSalaryOpen(true)}>
              Editar
            </button>
          }
        />
        <Stat label="Límite de gasto" value={formatCurrency(budget?.limit ?? 0)} hint={`${budget?.limitPercent ?? 0} % del sueldo`} />
        <Stat label="Gastado" value={formatCurrency(spendingTotal)} hint={`${limitUsePercent} % del límite`} />
        <Stat
          label="Disponible"
          value={formatCurrency(availableTotal)}
          hint="Sueldo − gastado"
          valueClassName={availableTotal < 0 ? 'text-destructive' : 'text-emerald-400'}
        />
      </div>

      <BudgetAllocationBar groups={groups} salary={salary} />
      <BudgetSwitches />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar categoría"
          aria-label="Buscar categoría"
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:max-w-xs"
        />
        {filterOpen && (
          <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1" aria-label="Filtros de categoría">
            {(
              [
                ['all', 'Todas'],
                ['limited', 'Con límite'],
                ['unlimited', 'Sin límite'],
                ['attention', 'Por revisar'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-md px-2.5 py-1.5 text-xs ${filter === key ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {summaryQuery.isPending ? (
        <div role="status" className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Cargando presupuesto…
        </div>
      ) : summaryQuery.isError ? (
        <div role="alert" className="rounded-xl border p-6 text-sm">
          No se pudo cargar el presupuesto.{' '}
          <Button variant="outline" size="sm" onClick={() => summaryQuery.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : visibleGroups.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">No hay categorías que coincidan con la búsqueda.</div>
      ) : grouping === 'group' && view !== 'table' ? (
        view === 'cards' ? (
          <div className="grid gap-4 xl:grid-cols-2">{visibleGroups.map(groupBlock)}</div>
        ) : (
          <div className="space-y-3 overflow-x-auto">
            <div className={`grid min-w-[760px] ${categoryGridClass} gap-3 px-4 py-2 text-xs font-medium text-muted-foreground`}>
              <span>Categoría</span>
              {showGroupColumn && <span>Grupo</span>}
              <span className="text-right">Límite</span>
              <span className="text-right">Gastado</span>
              <span>Uso del límite</span>
              <span className="text-right">Disponible</span>
              <span />
            </div>
            {visibleGroups.map(groupBlock)}
          </div>
        )
      ) : view === 'cards' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visibleGroups.flatMap((group) => group.categories.map(categoryCard))}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className={`grid min-w-[760px] ${categoryGridClass} gap-3 bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground`}>
            <span>Categoría</span>
            {showGroupColumn && <span>Grupo</span>}
            <span className="text-right">Límite</span>
            <span className="text-right">Gastado</span>
            <span>Uso del límite</span>
            <span className="text-right">Disponible</span>
            <span />
          </div>
          {grouping === 'group' &&
            visibleGroups.map((group, index) =>
              view === 'table' ? (
                <div
                  key={group.id}
                  className={`grid min-w-[760px] ${categoryGridClass} items-center gap-3 border-t bg-muted/25 px-4 py-2 text-xs font-semibold`}
                >
                  <span className="col-span-2">
                    <span className="mr-2 inline-block size-2 rounded-sm" style={{ backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }} />
                    {group.name} · {group.percentage} %
                  </span>
                  <span />
                  <span className="text-right tabular-nums">{formatCurrency(group.spent)}</span>
                  <span className="text-right tabular-nums">{formatCurrency(group.assigned)} asignado</span>
                  <span className={group.available < 0 ? 'text-right text-destructive' : 'text-right text-emerald-400'}>
                    {formatCurrency(group.available)} disponible
                  </span>
                  <span />
                </div>
              ) : (
                <div
                  key={group.id}
                  className={`grid min-w-[760px] ${categoryGridClass} items-center gap-3 border-t bg-muted/25 px-4 py-2 text-xs font-semibold`}
                >
                  <span>
                    <span className="mr-2 inline-block size-2 rounded-sm" style={{ backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }} />
                    {group.name} · {group.percentage} %
                  </span>
                  <span className="text-right tabular-nums">{formatCurrency(group.spent)} gastado</span>
                  <span className="text-right tabular-nums">{formatCurrency(group.assigned)} asignado</span>
                  <span className={group.available < 0 ? 'text-right text-destructive' : 'text-right text-emerald-400'}>
                    {formatCurrency(group.available)} disponible
                  </span>
                  <span />
                  <span />
                </div>
              ),
            )}
          {visibleGroups.flatMap((group) => group.categories.map((category) => categoryRow(category, group)))}
          <div className={`grid min-w-[760px] ${categoryGridClass} gap-3 border-t bg-muted/40 px-4 py-3 text-sm font-semibold`}>
            <span>Total</span>
            {showGroupColumn && <span />}
            <span className="text-right tabular-nums">{formatCurrency(budget?.limit ?? totals.limit)}</span>
            <span className="text-right tabular-nums">{formatCurrency(totals.spent)}</span>
            <span>{limitUsePercent} %</span>
            <span className="text-right tabular-nums text-emerald-400">{formatCurrency(availableTotal)}</span>
            <span />
          </div>
        </div>
      )}

      <BudgetGroupDialog open={groupDialog.open} onOpenChange={(open) => setGroupDialog((s) => ({ ...s, open }))} group={groupDialog.group} />
      <CategoryDialog
        open={categoryDialog.open}
        onOpenChange={(open) => setCategoryDialog((s) => ({ ...s, open }))}
        category={categoryDialog.category}
      />
      {limitOf && categoryOf(limitOf.id) && (
        <CategoryLimitDialog category={categoryOf(limitOf.id)!} line={limitOf.line} month={month} year={year} onClose={() => setLimitOf(null)} />
      )}
      {salaryOpen && <SalaryDialog open onOpenChange={setSalaryOpen} initialPeriod={{ month, year }} onSaved={() => setSalaryOpen(false)} />}
    </div>
  )
}
