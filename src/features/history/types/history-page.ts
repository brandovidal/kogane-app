import type { HistoryEntry } from '@/shared/api/types'

export type HistoryActionFilter = 'all' | 'create' | 'update' | 'delete'

export interface HistoryPeriodSummary {
  entries: HistoryEntry[]
  labels: Record<string, string>
  total: number
}

export interface HistoryRecordSelection {
  entity: string
  entityId: string
  title: string
  entryId: string
}
