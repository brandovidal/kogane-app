import { X } from 'lucide-react'
import { useRecordHistory } from '../hooks/history'
import { ENTITY_LABELS } from '../lib/history-view'
import type { HistoryRecordSelection } from '../types/history-page'
import { Button } from '@/ui/button'
import { HistoryTimeline } from './HistoryTimeline'
import { HistoryTimelineLoading } from './HistoryTimelineLoading'

export function HistoryRecordDetailPanel({ selection, onClose }: { selection: HistoryRecordSelection; onClose: () => void }) {
  const query = useRecordHistory(selection.entity, selection.entityId)

  return (
    <aside className="h-fit rounded-xl border bg-card p-4 lg:sticky lg:top-4" aria-label={`Historial del registro: ${selection.title}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Historial del registro</p>
          <h2 className="mt-1 truncate text-lg font-semibold">{selection.title}</h2>
          <p className="text-sm text-muted-foreground">
            {ENTITY_LABELS[selection.entity] ?? selection.entity}
            {query.data && ` · ${query.data.total} cambios`}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Cerrar detalle" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </header>
      {query.isPending ? (
        <HistoryTimelineLoading />
      ) : query.isError ? (
        <div className="rounded-lg border p-4 text-sm">
          <p role="alert" className="text-destructive">
            No se pudo cargar el historial del registro.
          </p>
          <Button className="mt-3" variant="outline" size="sm" onClick={() => void query.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : (
        <HistoryTimeline entries={query.data?.items ?? []} labels={query.data?.labels ?? {}} compact />
      )}
    </aside>
  )
}
