import { Fragment, useMemo, useState } from 'react'
import { CreditCard, Pencil, Plus, Search, Users } from 'lucide-react'

import { usePaymentMethods, useSavePaymentMethod } from '@/shared/api/hooks/catalogs'
import { useExpenses } from '@/features/expenses/hooks/expenses'
import { EXPENSE_RESOURCES, type CreditCardExpense } from '@/shared/api/types'
import { usePeriod } from '@/shared/stores/period.store'
import { formatCurrency } from '@/shared/lib/currency'
import { ViewToggle } from '@/shared/components/data-display/ViewToggle'
import { useViewMode } from '@/shared/hooks/useViewMode'
import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'

import { CardHoldersDialog } from './CardHoldersDialog'
import { NewCardDialog } from './NewCardDialog'
import { PaymentMethodLabel } from '../payment-methods/PaymentMethodLabel'
import { PAYMENT_METHOD_TYPE_LABELS } from '../../constants/payment-methods'

type Method = NonNullable<ReturnType<typeof usePaymentMethods>['data']>[number]
type StatusFilter = 'all' | 'active' | 'inactive'
const EMPTY_EXPENSES: CreditCardExpense[] = []
const typeLabel = (type: Method['type']) => PAYMENT_METHOD_TYPE_LABELS[type] ?? 'Medio de pago'

function SummaryMetric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-lg font-semibold tabular-nums">{value}</p>
        {detail && <p className="truncate text-xs text-muted-foreground">{detail}</p>}
      </CardContent>
    </Card>
  )
}

function MethodTile({
  method,
  amount,
  credit,
  onEdit,
  onHolders,
  onActivate,
  onToggle,
}: {
  method: Method
  amount: number
  credit: boolean
  onEdit: () => void
  onHolders: () => void
  onActivate: () => void
  onToggle: (key: 'isActive' | 'showInBot' | 'supportsAmortization' | 'supportsCashback', value: boolean) => void
}) {
  const color = method.color ?? '#475569'
  return (
    <article className={`min-w-0 rounded-xl border bg-card p-4 ${method.isActive ? '' : 'opacity-70'}`}>
      <div className="flex items-start gap-3">
        <div
          className="flex h-16 w-28 shrink-0 flex-col justify-between rounded-xl p-3 text-white shadow-inner"
          style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 58%, #101116))` }}
        >
          <CreditCard className="size-4 opacity-75" />
          <span className="truncate text-[10px] font-bold uppercase tracking-widest">{method.code || method.name} ····</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold">{method.name}</h3>
              <p className="truncate text-xs text-muted-foreground">
                {typeLabel(method.type)}
                {method.bank ? ` · ${method.bank}` : ''}
                {method.network ? ` · ${method.network}` : ''}
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Editar ${method.name}`} onClick={onEdit}>
              <Pencil className="size-4" />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            <span className={`rounded-full px-2 py-0.5 ${method.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
              {method.isActive ? 'La tengo' : 'Sin activar'}
            </span>
            {method.showInBot && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">En el bot</span>}
            {credit && method.supportsAmortization && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-400">Amortización</span>}
            {credit && method.supportsCashback && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-400">Cashback</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {credit && (
          <div className="rounded-lg border p-2">
            <p className="text-muted-foreground">Cierra el</p>
            <p className="mt-0.5 font-semibold">{method.billingCloseDay ?? '—'}</p>
          </div>
        )}
        {credit && (
          <div className="rounded-lg border p-2">
            <p className="text-muted-foreground">Paga el</p>
            <p className="mt-0.5 font-semibold">{method.paymentDueDay ?? '—'}</p>
          </div>
        )}
        <div className="rounded-lg border p-2">
          <p className="text-muted-foreground">Estado del mes</p>
          <p className="mt-0.5 truncate font-semibold">{formatCurrency(amount)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        {method.isActive ? (
          <>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Switch
                checked={method.showInBot}
                disabled={!method.isActive}
                aria-label={`${method.name} en el bot`}
                onCheckedChange={(value) => onToggle('showInBot', value)}
              />
              En el bot
            </label>
            {credit && (
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Switch
                  checked={method.supportsAmortization}
                  aria-label={`Amortización en ${method.name}`}
                  onCheckedChange={(value) => onToggle('supportsAmortization', value)}
                />
                Amortización
              </label>
            )}
            {credit && (
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Switch
                  checked={method.supportsCashback}
                  aria-label={`Cashback en ${method.name}`}
                  onCheckedChange={(value) => onToggle('supportsCashback', value)}
                />
                Cashback
              </label>
            )}
            {credit && (
              <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onHolders}>
                <Users className="mr-1 size-3.5" />
                Titulares
              </Button>
            )}
          </>
        ) : (
          <Button type="button" size="sm" onClick={onActivate}>
            Activar
          </Button>
        )}
      </div>
    </article>
  )
}

export function AccountsTable({ scope }: { scope: 'credit' | 'other' }) {
  const all = usePaymentMethods().data ?? []
  const methods = all.filter((method) => (scope === 'credit' ? method.type === 'credit_card' : method.type !== 'credit_card'))
  const credit = scope === 'credit'
  const pageKey = credit ? 'settings-credit-cards' : 'settings-debit-wallets'
  const [view, setView] = useViewMode(pageKey, 'cards')
  const save = useSavePaymentMethod()
  const month = usePeriod((state) => state.month)
  const year = usePeriod((state) => state.year)
  const expenses = useExpenses(EXPENSE_RESOURCES.creditCard, { month, year }, undefined, credit).data ?? EMPTY_EXPENSES
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [holdersOf, setHoldersOf] = useState<{ id: string; name: string } | null>(null)
  const [editing, setEditing] = useState<Method | null>(null)
  const [creating, setCreating] = useState(false)
  const monthlyAmounts = useMemo(() => {
    const result = new Map<string, number>()
    expenses.forEach((expense) => {
      if (expense.paymentMethodId)
        result.set(expense.paymentMethodId, (result.get(expense.paymentMethodId) ?? 0) + (expense.amountInPen ?? expense.amount))
    })
    return result
  }, [expenses])
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const visible = methods.filter((method) => {
    const matchesSearch =
      !normalizedSearch ||
      [method.name, method.code, method.bank, method.network].some((part) => part?.toLocaleLowerCase().includes(normalizedSearch))
    return matchesSearch && (filter === 'all' || (filter === 'active' ? method.isActive : !method.isActive))
  })
  const activeCount = methods.filter((method) => method.isActive).length
  const inactiveCount = methods.length - activeCount
  const totalAmount = [...monthlyAmounts.values()].reduce((sum, amount) => sum + amount, 0)
  const nextCard = methods
    .filter((method) => method.isActive && method.paymentDueDay)
    .sort((a, b) => (a.paymentDueDay ?? 32) - (b.paymentDueDay ?? 32))[0]
  const noDays = methods.filter((method) => method.isActive && (!method.billingCloseDay || !method.paymentDueDay)).length

  const update = (method: Method, body: Record<string, unknown>) => save.mutate({ id: method.id, name: method.name, type: method.type, ...body })
  const toggle = (method: Method, key: 'isActive' | 'showInBot' | 'supportsAmortization' | 'supportsCashback', value: boolean) =>
    update(method, { [key]: value })
  const cardAmount = (method: Method) => monthlyAmounts.get(method.id) ?? 0
  const toggleFilter = (value: StatusFilter, label: string, count: number) => (
    <Button
      type="button"
      size="sm"
      variant={filter === value ? 'secondary' : 'ghost'}
      className="h-8 whitespace-nowrap"
      onClick={() => setFilter(value)}
    >
      {label} · {count}
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle view={view} onChange={setView} showLabels />
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={credit ? 'Buscar tarjeta' : 'Buscar medio'}
            aria-label={credit ? 'Buscar tarjeta' : 'Buscar medio'}
          />
        </div>
        <div className="flex rounded-lg border p-1">
          {toggleFilter('all', 'Todas', methods.length)}
          {toggleFilter('active', credit ? 'La tengo' : 'Activas', activeCount)}
          {toggleFilter('inactive', 'Sin activar', inactiveCount)}
        </div>
        <Button type="button" className="ml-auto" onClick={() => setCreating(true)}>
          <Plus className="mr-1 size-4" />
          {credit ? 'Nueva tarjeta' : 'Nuevo medio'}
        </Button>
      </div>

      {credit && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryMetric label="Tarjetas activas" value={`${activeCount} de ${methods.length}`} />
          <SummaryMetric
            label={`Estados de ${new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(year, month - 1))}`}
            value={formatCurrency(totalAmount)}
          />
          <SummaryMetric label="Próximo pago" value={nextCard ? `${nextCard.name} · día ${nextCard.paymentDueDay}` : 'Sin configurar'} />
          <SummaryMetric label="Sin días configurados" value={String(noDays)} />
        </div>
      )}

      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {methods.length ? 'No hay resultados para estos filtros.' : `Aún no tienes ${credit ? 'tarjetas de crédito' : 'medios de pago'}.`}
          </CardContent>
        </Card>
      ) : view === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visible.map((method) => (
            <MethodTile
              key={method.id}
              method={method}
              amount={cardAmount(method)}
              credit={credit}
              onEdit={() => setEditing(method)}
              onHolders={() => setHoldersOf({ id: method.id, name: method.name })}
              onActivate={() => toggle(method, 'isActive', true)}
              onToggle={(key, value) => toggle(method, key, value)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarjeta o medio</TableHead>
                {credit && (
                  <>
                    <TableHead>Cierre</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Amortiz.</TableHead>
                    <TableHead>Cashback</TableHead>
                  </>
                )}
                <TableHead>En el bot</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(['active', 'inactive'] as const).map((status) => {
                const rows = visible.filter((method) => method.isActive === (status === 'active'))
                if (!rows.length) return null
                return (
                  <Fragment key={`group-${status}`}>
                    <TableRow key={`section-${status}`}>
                      <TableCell
                        colSpan={credit ? 8 : 5}
                        className="bg-muted/40 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                      >
                        {status === 'active' ? `La tengo · ${rows.length}` : `Sin activar · ${rows.length}`}
                      </TableCell>
                    </TableRow>
                    {rows.map((method) => (
                      <TableRow key={method.id} className={!method.isActive ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="size-7 shrink-0 rounded-md" style={{ background: method.color ?? 'var(--muted)' }} />
                            <div>
                              <PaymentMethodLabel name={method.name} type={method.type} color={method.color} />
                              <p className="text-xs text-muted-foreground">{method.isActive ? formatCurrency(cardAmount(method)) : 'Sin activar'}</p>
                            </div>
                          </div>
                        </TableCell>
                        {credit && (
                          <>
                            <TableCell>{method.billingCloseDay ?? '—'}</TableCell>
                            <TableCell>{method.paymentDueDay ?? '—'}</TableCell>
                            <TableCell>
                              <Switch
                                checked={method.supportsAmortization}
                                disabled={!method.isActive}
                                aria-label={`Amortización ${method.name}`}
                                onCheckedChange={(value) => toggle(method, 'supportsAmortization', value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={method.supportsCashback}
                                disabled={!method.isActive}
                                aria-label={`Cashback ${method.name}`}
                                onCheckedChange={(value) => toggle(method, 'supportsCashback', value)}
                              />
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <Switch
                            checked={method.showInBot}
                            disabled={!method.isActive}
                            aria-label={`En el bot ${method.name}`}
                            onCheckedChange={(value) => toggle(method, 'showInBot', value)}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full border px-2 py-1 text-xs">{method.isActive ? 'La tengo' : 'Sin activar'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            {method.isActive && credit && (
                              <Button size="sm" variant="outline" onClick={() => setHoldersOf({ id: method.id, name: method.name })}>
                                <Users className="mr-1 size-3.5" />
                                Titulares
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={method.isActive ? 'outline' : 'default'}
                              onClick={() => (method.isActive ? setEditing(method) : toggle(method, 'isActive', true))}
                            >
                              {method.isActive ? (
                                <>
                                  <Pencil className="mr-1 size-3.5" />
                                  Editar
                                </>
                              ) : (
                                'Activar'
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {credit && inactiveCount > 0 && (
        <section className="space-y-3">
          <header className="flex items-center gap-2">
            <h2 className="font-semibold">Disponibles para activar</h2>
            <span className="text-xs text-muted-foreground">
              Catálogo base · {inactiveCount} {inactiveCount === 1 ? 'tarjeta' : 'tarjetas'}
            </span>
            <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={() => setCreating(true)}>
              <Plus className="mr-1 size-3.5" />
              Otra tarjeta
            </Button>
          </header>
          {filter === 'all' && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {methods
                .filter((method) => !method.isActive)
                .map((method) => (
                  <Card key={method.id}>
                    <CardContent className="space-y-2 p-3">
                      <PaymentMethodLabel name={method.name} type={method.type} color={method.color} />
                      <p className="text-xs text-muted-foreground">{typeLabel(method.type)}</p>
                      <Button type="button" size="sm" variant="outline" onClick={() => toggle(method, 'isActive', true)}>
                        Activar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </section>
      )}
      {creating && (
        <NewCardDialog
          onClose={() => setCreating(false)}
          defaultType={credit ? 'credit_card' : 'debit_card'}
          catalogCards={credit ? methods.filter((method) => !method.isActive) : []}
        />
      )}
      {editing && <NewCardDialog key={editing.id} method={editing} onClose={() => setEditing(null)} />}
      {holdersOf && <CardHoldersDialog key={holdersOf.id} card={holdersOf} onClose={() => setHoldersOf(null)} />}
    </div>
  )
}
