import { Badge } from '@/ui/badge'
import { cn } from '@/shared/utils/cn'
import { HISTORY_ACTION_STYLES, HISTORY_SOURCE_ICONS } from '../constants/history-ui'
import { ACTION_LABELS, ENTITY_LABELS, SOURCE_LABELS, fieldLabel } from '../lib/history-view'
import { formatHistoryTime } from '../lib/history-timeline'
import type { HistoryEntry } from '@/shared/api/types'
import { HistoryChanges } from './HistoryChanges'

interface HistoryTimelineItemProps {
  entry: HistoryEntry
  labels: Record<string, string>
  showRecord?: boolean
  compact?: boolean
  onSelect?: (entry: HistoryEntry) => void
  selected?: boolean
}

export function HistoryTimelineItem(props: HistoryTimelineItemProps) {
  if (!props.compact) {
    return (
      <li className="min-w-0">
        <HistoryActivityCard {...props} />
      </li>
    )
  }

  const { entry, labels } = props
  const action = HISTORY_ACTION_STYLES[entry.action]
  const ActionIcon = action.icon
  const SourceIcon = HISTORY_SOURCE_ICONS[entry.source]
  const title = entry.action === 'update' && entry.changes.length === 1 ? fieldLabel(entry.changes[0].field) : ACTION_LABELS[entry.action]

  return (
    <li className="relative min-w-0 pb-3 pl-8 last:pb-0">
      <span
        aria-hidden="true"
        className={cn('absolute left-0 top-1 flex size-6 items-center justify-center rounded-full ring-4 ring-background', action.className)}
      >
        <ActionIcon className="size-3.5" />
      </span>
      <article className="min-w-0 space-y-2">
        <header className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-semibold">{title}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <SourceIcon aria-hidden="true" className="size-3.5" />
            {SOURCE_LABELS[entry.source]}
          </span>
          <time dateTime={entry.createdAt} className="ml-auto text-xs tabular-nums text-muted-foreground">
            {formatHistoryTime(entry.createdAt)}
          </time>
        </header>
        <HistoryChanges entry={entry} labels={labels} compact />
      </article>
    </li>
  )
}

/** Reusable full card for an event in the activity history. */
export function HistoryActivityCard({ entry, labels, showRecord = true, onSelect, selected = false }: HistoryTimelineItemProps) {
  const action = HISTORY_ACTION_STYLES[entry.action]
  const ActionIcon = action.icon
  const SourceIcon = HISTORY_SOURCE_ICONS[entry.source]
  const title = entry.title || ENTITY_LABELS[entry.entity] || entry.entity
  const actorLabel = entry.actorId ? labels[entry.actorId] : undefined

  return (
    <article
      className={cn('min-w-0 overflow-hidden rounded-xl border bg-card transition-colors', selected && 'border-primary/70 ring-1 ring-primary/50')}
    >
      <header className="flex min-w-0 items-center gap-3 p-4 sm:px-5">
        <span aria-hidden="true" className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', action.className)}>
          <ActionIcon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <div className="min-w-0 flex-1 basis-full sm:basis-auto">
            {showRecord &&
              (onSelect ? (
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(entry)}
                  className="block max-w-full truncate text-left text-sm font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {title}
                </button>
              ) : (
                <p className="truncate text-sm font-semibold">{title}</p>
              ))}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={action.className}>
                {ACTION_LABELS[entry.action]}
              </Badge>
              <span className="text-xs text-muted-foreground">{ENTITY_LABELS[entry.entity] ?? entry.entity}</span>
            </div>
          </div>
          <div className="flex w-full shrink-0 items-center justify-end gap-2 self-center sm:ml-auto sm:w-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              <SourceIcon aria-hidden="true" className="size-3.5" />
              {SOURCE_LABELS[entry.source]}
            </span>
            <span
              aria-label={`Usuario ${actorLabel ?? (entry.actorId ? 'desconocido' : 'no disponible')}`}
              className="flex size-8 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground"
            >
              {entry.actorId ? (actorLabel ? actorInitials(actorLabel) : 'BV') : '—'}
            </span>
            <time dateTime={entry.createdAt} className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
              {formatHistoryTime(entry.createdAt)}
            </time>
          </div>
        </div>
      </header>
      <div className="border-t bg-muted/20 px-4 py-3 sm:px-5">
        <HistoryChanges entry={entry} labels={labels} />
      </div>
    </article>
  )
}

function actorInitials(label?: string) {
  if (!label) return '—'
  const parts = label.trim().split(/\s+/).filter(Boolean)
  if (parts.length > 1) return `${parts[0][0]}${parts.at(-1)?.[0]}`.toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}
