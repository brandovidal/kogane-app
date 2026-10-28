import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { HistoryEntry } from '@/shared/api/types'
import { useHistory, useHistoryPeriodSummary, type HistoryFilter } from '@/features/history/hooks/history'
import { HistorySummaryPanel } from '@/features/history/components/HistorySummaryPanel'
import { HistoryRecordDetailPanel } from '@/features/history/components/HistoryRecordDetailPanel'
import { HistoryTimeline } from './HistoryTimeline'
import { HistoryTimelineLoading } from './HistoryTimelineLoading'
import { useUrlFilters } from '@/shared/hooks/useUrlFilters'
import { usePeriod } from '@/shared/stores/period.store'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { ACTION_LABELS, ENTITY_LABELS, SOURCE_LABELS } from '@/features/history/lib/history-view'
import { HISTORY_ACTION_FILTERS, HISTORY_ALL, HISTORY_SOURCES, HISTORY_TABLES } from '@/features/history/constants/history-page'
import type { HistoryActionFilter, HistoryPeriodSummary, HistoryRecordSelection } from '@/features/history/types/history-page'

const FILTER_KEYS = ['q', 'entity', 'source', 'action', 'actor', 'page'] as const
type HistoryPanelFilters = Partial<Record<(typeof FILTER_KEYS)[number], string>>
type HistoryListState = { key: string; pages: Record<number, NonNullable<ReturnType<typeof useHistory>['data']>> }
const HISTORY_BATCH_SIZE = 5

export function HistoryPanel() {
  const month = usePeriod((state) => state.month)
  const year = usePeriod((state) => state.year)
  const [filters, setFilters] = useUrlFilters<HistoryPanelFilters>(FILTER_KEYS)
  const page = Math.max(Number(filters.page) || 1, 1)
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  const listKey = JSON.stringify({ month, year, entity: filters.entity, source: filters.source })
  const query: HistoryFilter = {
    from,
    to,
    entity: filters.entity,
    source: filters.source as HistoryFilter['source'],
    page,
  }
  const listQuery = useHistory(query)
  const summaryQuery = useHistoryPeriodSummary(month, year)
  const [loaded, setLoaded] = useState<HistoryListState>({ key: '', pages: {} })
  const [selection, setSelection] = useState<HistoryRecordSelection | null>(null)
  const [visibleCount, setVisibleCount] = useState(HISTORY_BATCH_SIZE)

  useEffect(() => {
    if (!listQuery.data || listQuery.data.page !== page) return
    setLoaded((previous) => ({
      key: listKey,
      pages: previous.key === listKey ? { ...previous.pages, [page]: listQuery.data } : { [page]: listQuery.data },
    }))
  }, [listKey, listQuery.data, page])

  useEffect(() => {
    setSelection(null)
    setVisibleCount(HISTORY_BATCH_SIZE)
  }, [listKey])

  const pages = useMemo(() => (loaded.key === listKey ? Object.values(loaded.pages) : []), [listKey, loaded])
  const entries = useMemo(() => {
    const unique = new Map<string, HistoryEntry>()
    for (const result of pages) for (const entry of result.items) unique.set(entry.id, entry)
    return [...unique.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }, [pages])
  const labels = useMemo(() => Object.assign({}, ...pages.map((result) => result.labels)), [pages])
  const currentData = listQuery.data?.page === page ? listQuery.data : pages[pages.length - 1]
  const total = currentData?.total ?? 0
  const summary = summaryQuery.data as HistoryPeriodSummary | undefined
  const actorNames = useMemo(() => {
    const actorIds = [...new Set((summary?.entries ?? []).map((entry) => entry.actorId).filter((id): id is string => !!id))]
    return actorIds.map((id) => ({ id, label: summary?.labels[id] ?? labels[id] ?? `Usuario ${id.slice(0, 6)}` }))
  }, [labels, summary])
  const action = (filters.action as HistoryActionFilter | undefined) ?? 'all'
  const filteredEntries = useMemo(() => {
    const search = filters.q?.trim().toLocaleLowerCase('es-PE') ?? ''
    return entries.filter((entry) => {
      if (action !== 'all' && entry.action !== action) return false
      if (filters.actor && entry.actorId !== filters.actor) return false
      if (search && !`${entry.title ?? ''} ${ENTITY_LABELS[entry.entity] ?? entry.entity}`.toLocaleLowerCase('es-PE').includes(search)) return false
      return true
    })
  }, [action, entries, filters.actor, filters.q])
  const visibleEntries = filteredEntries.slice(0, visibleCount)
  const activeFilters = [filters.q, filters.entity, filters.source, action !== 'all' ? action : undefined, filters.actor].filter(Boolean).length
  const monthLabel = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric', timeZone: 'America/Lima' }).format(
    new Date(year, month - 1, 15, 12),
  )
  const setFilter = (key: keyof HistoryPanelFilters, value: string | undefined) =>
    setFilters({ ...filters, [key]: value || undefined, page: undefined })
  const selectedTable = filters.entity ?? HISTORY_ALL
  const selectedSource = filters.source ?? HISTORY_ALL
  const selectedActor = filters.actor ?? HISTORY_ALL
  const hasMore = visibleCount < filteredEntries.length || entries.length < total
  const loadNextBatch = () => {
    setVisibleCount((count) => count + HISTORY_BATCH_SIZE)
    if (visibleCount >= entries.length && entries.length < total) {
      setFilters({ ...filters, page: String(page + 1) })
    }
  }
  const monthSummary = summary?.total ?? total

  const clearFilters = () => setFilters({})
  const chips = [
    filters.q ? { key: 'q' as const, label: `Nombre · ${filters.q}` } : undefined,
    filters.entity ? { key: 'entity' as const, label: `Tabla · ${ENTITY_LABELS[filters.entity] ?? filters.entity}` } : undefined,
    filters.source ? { key: 'source' as const, label: `Origen · ${SOURCE_LABELS[filters.source] ?? filters.source}` } : undefined,
    action !== 'all' ? { key: 'action' as const, label: `Acción · ${ACTION_LABELS[action] ?? action}` } : undefined,
    filters.actor
      ? { key: 'actor' as const, label: `Usuario · ${actorNames.find((user) => user.id === filters.actor)?.label ?? filters.actor}` }
      : undefined,
  ].filter((chip): chip is NonNullable<typeof chip> => !!chip)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-56 flex-1 sm:max-w-sm">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar por nombre del registro"
            className="h-10 pl-9"
            placeholder="Buscar por nombre del registro"
            value={filters.q ?? ''}
            onChange={(event) => setFilter('q', event.target.value || undefined)}
          />
        </label>
        <Select value={selectedTable} onValueChange={(value) => setFilter('entity', value === HISTORY_ALL ? undefined : value)}>
          <SelectTrigger aria-label="Filtrar por tabla" className="h-10 w-full sm:w-52">
            <SelectValue placeholder="Todas las tablas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HISTORY_ALL}>Todas las tablas</SelectItem>
            {HISTORY_TABLES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div
          className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border bg-card p-1"
          role="tablist"
          aria-label="Filtrar por acción"
        >
          {HISTORY_ACTION_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={action === id}
              onClick={() => setFilter('action', id === 'all' ? undefined : id)}
              className={`h-8 shrink-0 rounded-md px-3 text-sm font-medium transition-colors ${action === id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Select value={selectedSource} onValueChange={(value) => setFilter('source', value === HISTORY_ALL ? undefined : value)}>
          <SelectTrigger aria-label="Filtrar por origen" className="h-10 w-full sm:w-44">
            <SelectValue placeholder="Todos los orígenes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HISTORY_ALL}>Todos los orígenes</SelectItem>
            {HISTORY_SOURCES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {actorNames.length > 1 && (
          <Select value={selectedActor} onValueChange={(value) => setFilter('actor', value === HISTORY_ALL ? undefined : value)}>
            <SelectTrigger aria-label="Filtrar por usuario" className="h-10 w-full sm:w-48">
              <SelectValue placeholder="Todos los usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={HISTORY_ALL}>Todos los usuarios</SelectItem>
              {actorNames.map(({ id, label }) => (
                <SelectItem key={id} value={id}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" className="h-9" onClick={clearFilters}>
            <X className="size-4" /> Limpiar {activeFilters} {activeFilters === 1 ? 'filtro' : 'filtros'}
          </Button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key, undefined)}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-primary/10 px-3 text-xs font-medium text-primary hover:bg-primary/15"
            >
              {chip.label} <X aria-hidden="true" className="size-3.5" />
            </button>
          ))}
          <span className="text-xs text-muted-foreground">
            {filteredEntries.length} de {monthSummary} cambios
          </span>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 space-y-4" aria-label="Cambios recientes">
          {listQuery.isLoading && entries.length === 0 ? (
            <HistoryTimelineLoading />
          ) : listQuery.isError && entries.length === 0 ? (
            <div className="rounded-xl border p-5 text-sm">
              <p role="alert" className="text-destructive">
                No se pudo leer el historial del período.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => void listQuery.refetch()}>
                Reintentar
              </Button>
            </div>
          ) : visibleEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="font-medium">{activeFilters ? 'Sin resultados' : 'Sin cambios en este período'}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeFilters ? 'Prueba con otros filtros.' : 'Las nuevas creaciones, ediciones y eliminaciones aparecerán aquí.'}
              </p>
            </div>
          ) : (
            <>
              <HistoryTimeline
                entries={visibleEntries}
                labels={Object.assign({}, summary?.labels, labels)}
                showRecord
                onSelect={(entry) =>
                  setSelection({
                    entity: entry.entity,
                    entityId: entry.entityId,
                    title: entry.title || ENTITY_LABELS[entry.entity] || entry.entity,
                    entryId: entry.id,
                  })
                }
                selectedId={selection?.entryId}
              />
              {listQuery.isError && (
                <p role="alert" className="text-sm text-destructive">
                  No se pudieron cargar más cambios. Intenta de nuevo.
                </p>
              )}
              {hasMore && (
                <Button variant="outline" className="w-full" disabled={listQuery.isFetching} onClick={loadNextBatch}>
                  {listQuery.isFetching ? 'Cargando cambios…' : `Cargar ${HISTORY_BATCH_SIZE} más`}
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Mostrando {visibleEntries.length} de {monthSummary} cambios · más recientes primero
              </p>
            </>
          )}
        </section>
        {selection ? (
          <HistoryRecordDetailPanel selection={selection} onClose={() => setSelection(null)} />
        ) : (
          <HistorySummaryPanel summary={summary} loading={summaryQuery.isPending} monthLabel={monthLabel} />
        )}
      </div>
    </div>
  )
}
