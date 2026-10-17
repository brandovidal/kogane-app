import { useState } from 'react'
import { Bell, ChevronDown, CircleAlert, CreditCard, HandCoins, ReceiptText, Wallet, type LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/currency'
import { formatDayMonth, getMonthName } from '@/shared/lib/dates'
import { cn } from '@/shared/utils/cn'
import type { DashboardPaymentTab } from '../types/dashboard'
import { DashboardPendingSummary } from './DashboardPendingSummary'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible'
import { Switch } from '@/ui/switch'
import {
  dueLabel,
  filterPending,
  groupByPerson,
  groupSection,
  isLate,
  limitList,
  pendingCounts,
  pluralize,
  sortByUrgency,
  summarizeSection,
  type PendingEntry,
  type PendingFilter,
  type PendingGroup,
} from '@/features/dashboard/lib/pending-groups'

interface PendingCardProps {
  entries: PendingEntry[]
  today: Date
  month: number
  year: number
  /** Billed (closed) month: "Por cerrar de …" instead of "Pendientes del mes". */
  isBilled: boolean
  onlySelectedMonth: boolean
  onOnlySelectedMonthChange: (checked: boolean) => void
  /** Month right before the selected one, to offer it in the empty state. */
  onGoToPreviousMonth: () => void
  onRegisterPayment: (tab: DashboardPaymentTab) => void
}

const money = (value: number | null, sign: '-' | '+' | '') => (value == null ? '—' : `${sign ? `${sign} ` : ''}${formatCurrency(value)}`)

function tabOf(entry: PendingEntry): DashboardPaymentTab {
  if (entry.kind === 'card') return 'card'
  if (entry.kind === 'debt') return 'debt'
  if (entry.kind === 'collect') return 'collect'
  return 'fixed'
}

function EntryRow({ entry, today, onRegisterPayment }: { entry: PendingEntry; today: Date; onRegisterPayment: (tab: DashboardPaymentTab) => void }) {
  const label = entry.paid ? null : dueLabel(entry.dueDate, today)
  const late = isLate(entry, today)
  const sign = entry.kind === 'collect' ? '+' : entry.amount == null ? '' : '-'
  return (
    <div className="flex flex-wrap items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{entry.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {entry.detail}
          {entry.dueDate && !entry.paid ? ` · vence ${formatDayMonth(entry.dueDate)}` : ''}
          {label ? <span className={late ? ' text-destructive' : undefined}> · {label}</span> : null}
        </p>
      </div>
      <span className="min-w-24 text-right text-sm font-semibold tabular-nums">{money(entry.amount, entry.paid ? '' : sign)}</span>
      {entry.kind === 'review' || entry.paid ? (
        <Button asChild variant="outline" size="sm" className="min-w-20">
          <a href={entry.href}>{entry.action}</a>
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="min-w-20" onClick={() => onRegisterPayment(tabOf(entry))}>
          {entry.action}
        </Button>
      )}
    </div>
  )
}

function GroupHeader({
  open,
  onOpenChange,
  title,
  subtitle,
  total,
  sign,
  icon: Icon,
  tone,
  action,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle: React.ReactNode
  total: string
  sign?: string
  icon: LucideIcon
  tone: string
  action?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center gap-3 py-2.5">
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', tone)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{title}</span>
          <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
        </span>
        <span
          className={cn(
            'shrink-0 text-right text-sm font-semibold tabular-nums',
            sign === '+' && 'text-emerald-400',
            sign === '-' && 'text-amber-300',
          )}
        >
          {total}
        </span>
        {action}
        <CollapsibleTrigger
          aria-label={`${open ? 'Contraer' : 'Expandir'} ${title}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown className={cn('size-4 transition-transform', !open && '-rotate-90')} />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>{children ? <div className="ml-11 divide-y border-l pl-3">{children}</div> : null}</CollapsibleContent>
    </Collapsible>
  )
}

const GROUP_PRESENTATION: Record<PendingGroup['kind'], { icon: LucideIcon; tone: string }> = {
  card: { icon: CreditCard, tone: 'bg-rose-500/10 text-rose-400' },
  fixed: { icon: ReceiptText, tone: 'bg-amber-500/10 text-amber-400' },
  debt: { icon: CircleAlert, tone: 'bg-red-500/10 text-red-400' },
  collect: { icon: HandCoins, tone: 'bg-emerald-500/10 text-emerald-400' },
  review: { icon: Wallet, tone: 'bg-primary/10 text-primary' },
}

function PayGroup({ group, today, onRegisterPayment }: { group: PendingGroup; today: Date; onRegisterPayment: (tab: DashboardPaymentTab) => void }) {
  const [open, setOpen] = useState(false)
  const next = dueLabel(group.nextDueDate, today)
  const subtitle = [
    pluralize(group.items.length, 'elemento', 'elementos'),
    group.late ? pluralize(group.late, 'retrasado', 'retrasados') : null,
    !group.late && next ? next : null,
    group.late && group.soon ? `${group.soon} ${group.soon === 1 ? 'vence' : 'vencen'} pronto` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const presentation = GROUP_PRESENTATION[group.kind]
  return (
    <GroupHeader
      open={open}
      onOpenChange={setOpen}
      title={group.label}
      subtitle={subtitle}
      total={money(group.total, '-')}
      sign="-"
      icon={presentation.icon}
      tone={presentation.tone}
      action={
        <Button variant="outline" size="sm" onClick={() => onRegisterPayment(tabOf(group.items[0]))}>
          Registrar pago
        </Button>
      }
    >
      {group.items.map((entry) => (
        <EntryRow key={entry.id} entry={entry} today={today} onRegisterPayment={onRegisterPayment} />
      ))}
    </GroupHeader>
  )
}

function CollectGroups({
  entries,
  today,
  onRegisterPayment,
}: {
  entries: PendingEntry[]
  today: Date
  onRegisterPayment: (tab: DashboardPaymentTab) => void
}) {
  const [open, setOpen] = useState(false)
  const people = groupByPerson(entries, today)
  const summary = summarizeSection(entries, 'collect')
  const late = people.reduce((count, person) => count + person.late, 0)
  return (
    <GroupHeader
      open={open}
      onOpenChange={setOpen}
      title="Cobros"
      subtitle={[
        `${pluralize(summary.count, 'elemento', 'elementos')} · ${pluralize(summary.people, 'persona', 'personas')}`,
        late ? pluralize(late, 'retrasado', 'retrasados') : null,
      ]
        .filter(Boolean)
        .join(' · ')}
      total={money(summary.total, '+')}
      sign="+"
      icon={HandCoins}
      tone="bg-emerald-500/10 text-emerald-400"
      action={
        <Button asChild variant="outline" size="sm">
          <a href="/resumen-deudas">Ver resumen</a>
        </Button>
      }
    >
      {people.map((person) => (
        <div key={person.person} className="flex items-center gap-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{person.person}</p>
            <p className="truncate text-xs text-muted-foreground">
              {pluralize(person.items.length, 'cobro', 'cobros')}
              {person.late ? ` · ${pluralize(person.late, 'retrasado', 'retrasados')}` : ''}
              {person.oldestDueDate ? ` · el más antiguo ${formatDayMonth(person.oldestDueDate)}` : ''}
            </p>
          </div>
          <span className="min-w-24 text-right text-sm font-semibold tabular-nums">{money(person.total, '')}</span>
          <Button variant="outline" size="sm" className="min-w-20" onClick={() => onRegisterPayment('collect')}>
            Cobrar
          </Button>
        </div>
      ))}
      <p className="py-2.5 text-xs text-muted-foreground">Abre el Resumen para editar y cambiar el estado por persona</p>
    </GroupHeader>
  )
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="eyebrow text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{title}</h3>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div className="divide-y">{children}</div>
    </section>
  )
}

export function PendingCard({
  entries,
  today,
  month,
  year,
  isBilled,
  onlySelectedMonth,
  onOnlySelectedMonthChange,
  onGoToPreviousMonth,
  onRegisterPayment,
}: PendingCardProps) {
  const [filter, setFilter] = useState<PendingFilter>('all')
  const [showAll, setShowAll] = useState(false)
  const counts = pendingCounts(entries, today)
  const monthName = getMonthName(month).toLowerCase()
  const previousName = getMonthName(month === 1 ? 12 : month - 1)

  const filtered = sortByUrgency(filterPending(entries, filter, today), today)
  const { shown, hidden } = limitList(filtered, showAll)
  const pay = summarizeSection(entries, 'pay')
  const collect = summarizeSection(entries, 'collect')
  const review = summarizeSection(entries, 'review')

  const tabs: Array<[PendingFilter, string, number]> = [
    ['all', 'Todos', counts.all],
    ['soon', 'Vencen pronto', counts.soon],
    ['late', 'Retrasados', counts.late],
  ]
  const paidEntries = entries.filter((entry) => entry.paid)

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {onlySelectedMonth ? (isBilled ? `Por cerrar de ${monthName}` : 'Pendientes del mes') : 'Pendientes'}
          <Badge variant="secondary">{counts.all}</Badge>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="dashboard-pending-only-month" className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Switch id="dashboard-pending-only-month" checked={onlySelectedMonth} onCheckedChange={onOnlySelectedMonthChange} size="sm" />
            {onlySelectedMonth ? `Solo ${monthName}` : 'Todos los meses'}
          </label>
          <div className="flex rounded-lg border bg-muted/50 p-0.5" role="tablist">
            {tabs.map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() => {
                  setFilter(value)
                  setShowAll(false)
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground',
                  filter === value && 'bg-background text-foreground shadow-sm',
                )}
              >
                {label}
                <span className="tabular-nums">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {counts.all > 0 && <DashboardPendingSummary pay={pay} collect={collect} review={review} />}
        {counts.all === 0 && paidEntries.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-1 text-center">
            <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Bell className="size-5" />
            </span>
            <p className="text-sm font-medium">{onlySelectedMonth ? `Todo al día en ${monthName}` : 'Todo al día'}</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              No tienes pagos, cobros ni borradores pendientes
              {onlySelectedMonth ? ' en este mes' : ''}. Los nuevos movimientos aparecerán aquí.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={onGoToPreviousMonth}>
                Ver {previousName.toLowerCase()} (facturado)
              </Button>
              <Button size="sm" onClick={() => onRegisterPayment('card')}>
                Registrar pago
              </Button>
            </div>
          </div>
        ) : filter === 'all' ? (
          <>
            {pay.count > 0 && (
              <Section title="Por pagar" hint="Ordenado por urgencia">
                {groupSection(entries, 'pay', today).map((group) => (
                  <PayGroup key={group.kind} group={group} today={today} onRegisterPayment={onRegisterPayment} />
                ))}
              </Section>
            )}
            {collect.count > 0 && (
              <Section title="Por cobrar" hint="Agrupado por persona">
                <CollectGroups entries={entries} today={today} onRegisterPayment={onRegisterPayment} />
              </Section>
            )}
            {review.count > 0 && (
              <Section title="Por revisar" hint="Sin cerrar">
                {entries
                  .filter((entry) => !entry.paid && entry.kind === 'review')
                  .map((entry) => (
                    <EntryRow key={entry.id} entry={entry} today={today} onRegisterPayment={onRegisterPayment} />
                  ))}
              </Section>
            )}
            {paidEntries.length > 0 && (
              <Section title="Pagado" hint="Mes facturado">
                {paidEntries.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} today={today} onRegisterPayment={onRegisterPayment} />
                ))}
              </Section>
            )}
          </>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {filter === 'soon' ? 'No hay vencimientos próximos' : 'No tienes pagos retrasados'}
          </p>
        ) : (
          <div>
            {filtered.length > shown.length || filtered.length > 6 ? (
              <p className="pb-1 text-xs text-muted-foreground">
                {showAll
                  ? `Mostrando los ${filtered.length}`
                  : `Mostrando los ${shown.length} más ${filter === 'late' ? 'antiguos' : 'próximos'} de ${filtered.length}`}{' '}
                · ordenados por {filter === 'late' ? 'días de retraso' : 'vencimiento'}
              </p>
            ) : null}
            <div className="divide-y">
              {shown.map((entry) => (
                <EntryRow key={entry.id} entry={entry} today={today} onRegisterPayment={onRegisterPayment} />
              ))}
            </div>
            {hidden > 0 && (
              <div className="flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
                <span>
                  {hidden} {filter === 'late' ? 'retrasados' : 'vencimientos'} más
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>
                  Ver los {filtered.length} {filter === 'late' ? 'retrasados' : 'pendientes'}
                </Button>
              </div>
            )}
          </div>
        )}
        {/* the year is part of the period the card describes */}
        <span className="sr-only">
          {getMonthName(month)} {year}
        </span>
      </CardContent>
    </Card>
  )
}
