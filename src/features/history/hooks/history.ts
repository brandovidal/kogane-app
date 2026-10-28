import { useQuery } from '@tanstack/react-query'
import type { HistoryPeriodSummary } from '../types/history-page'
import { getHistory, getRecordHistory, type HistoryFilter } from '../services/history.service'

const historyKeys = {
  all: ['history'] as const,
  list: (filter: HistoryFilter) => ['history', 'list', filter] as const,
  record: (entity: string, id: string, page = 1) => ['history', 'record', entity, id, page] as const,
  summary: (month: number, year: number) => ['history', 'summary', month, year] as const,
}

export type { HistoryFilter } from '../services/history.service'

// Every change, newest first, filtered by table, source and dates (P29)
export const useHistory = (filter: HistoryFilter) =>
  useQuery({
    queryKey: historyKeys.list(filter),
    queryFn: () => getHistory(filter),
    staleTime: 0,
  })

// The monthly sidebar needs full-period counts; the timeline itself stays paginated at 30 entries.
export const useHistoryPeriodSummary = (month: number, year: number) =>
  useQuery({
    queryKey: historyKeys.summary(month, year),
    queryFn: async (): Promise<HistoryPeriodSummary> => {
      const from = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      const first = await getHistory({ from, to, page: 1 })
      const pageCount = Math.ceil(first.total / first.pageSize)
      const remaining = await Promise.all(Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) => getHistory({ from, to, page: index + 2 })))
      const results = [first, ...remaining]
      return {
        entries: results.flatMap((result) => result.items),
        labels: Object.assign({}, ...results.map((result) => result.labels)),
        total: first.total,
      }
    },
    staleTime: 30_000,
  })

// The timeline of one record (the ⋯ of a row)
export const useRecordHistory = (entity: string, id: string, options: { enabled?: boolean; page?: number } = {}) =>
  useQuery({
    queryKey: historyKeys.record(entity, id, options.page),
    queryFn: () => getRecordHistory(entity, id, options.page),
    staleTime: 0,
    enabled: options.enabled ?? true,
  })
