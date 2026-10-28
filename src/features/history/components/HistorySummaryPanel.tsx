import { Bot, Clock3, Globe, PackageOpen, Terminal } from 'lucide-react'
import { ENTITY_LABELS, SOURCE_LABELS, ACTION_LABELS } from '../lib/history-view'
import type { HistoryPeriodSummary } from '../types/history-page'

const SOURCES = [
  { key: 'web', label: SOURCE_LABELS.web, Icon: Globe },
  { key: 'bot', label: SOURCE_LABELS.bot, Icon: Bot },
  { key: 'import', label: SOURCE_LABELS.import, Icon: PackageOpen },
  { key: 'scheduler', label: 'Programado', Icon: Clock3 },
  { key: 'cli', label: SOURCE_LABELS.cli, Icon: Terminal },
] as const

const ACTIONS = [
  { key: 'create', label: ACTION_LABELS.create, color: 'bg-emerald-400' },
  { key: 'update', label: ACTION_LABELS.update, color: 'bg-indigo-300' },
  { key: 'delete', label: ACTION_LABELS.delete, color: 'bg-red-400' },
] as const

export function HistorySummaryPanel({ summary, loading, monthLabel }: { summary?: HistoryPeriodSummary; loading: boolean; monthLabel: string }) {
  const entries = summary?.entries ?? []
  const total = summary?.total ?? 0
  const actionCount = (key: string) => entries.filter((entry) => entry.action === key).length
  const sourceCount = (key: string) => entries.filter((entry) => entry.source === key).length
  const entities = new Map<string, number>()
  for (const entry of entries) entities.set(entry.entity, (entities.get(entry.entity) ?? 0) + 1)
  const commonEntities = [...entities.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const monthCount = new Intl.NumberFormat('es-PE').format(total)

  return (
    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start" aria-label="Resumen del período">
      <section className="space-y-4 rounded-xl border bg-card p-4">
        <header>
          <h2 className="font-semibold">Resumen del período</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? 'Cargando cambios…' : `${monthCount} cambios · ${monthLabel.toLowerCase()}`}
          </p>
        </header>
        <div aria-hidden="true" className="flex h-2 overflow-hidden rounded-full bg-muted">
          {ACTIONS.map(({ key, color }) => {
            const count = actionCount(key)
            return <span key={key} className={`${color} transition-[width]`} style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
          })}
        </div>
        <dl className="space-y-2">
          {ACTIONS.map(({ key, label, color }) => (
            <div key={key} className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <span aria-hidden="true" className={`size-2 rounded-full ${color}`} />
                {label}
              </dt>
              <dd className="font-medium tabular-nums">{loading ? '—' : actionCount(key)}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t" />
        <dl className="space-y-2">
          {SOURCES.map(({ key, label, Icon }) => (
            <div key={key} className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Icon aria-hidden="true" className="size-3.5" />
                {label}
              </dt>
              <dd className="font-medium tabular-nums">{loading ? '—' : sourceCount(key)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Tablas con más cambios</h2>
        {commonEntities.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {commonEntities.map(([entity, count]) => (
              <li key={entity} className="flex items-center justify-between gap-3">
                <span className="truncate">{ENTITY_LABELS[entity] ?? entity}</span>
                <span className="tabular-nums text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{loading ? 'Calculando…' : 'Todavía no hay cambios en este período.'}</p>
        )}
      </section>

      <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Solo lectura.</span> Se guarda cada creación, edición y eliminación; no se puede deshacer
        desde aquí.
      </p>
    </aside>
  )
}
