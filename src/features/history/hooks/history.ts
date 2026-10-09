import { useQuery } from "@tanstack/react-query";

import {
  getHistory,
  getRecordHistory,
  type HistoryFilter,
} from "../services/history.service";

export const historyKeys = {
  all: ["history"] as const,
  list: (filter: HistoryFilter) => ["history", "list", filter] as const,
  record: (entity: string, id: string, page = 1) =>
    ["history", "record", entity, id, page] as const,
};

export type { HistoryFilter } from "../services/history.service";

// Every change, newest first, filtered by table, source and dates (P29)
export const useHistory = (filter: HistoryFilter) =>
  useQuery({
    queryKey: historyKeys.list(filter),
    queryFn: () => getHistory(filter),
    staleTime: 0,
  });

// The timeline of one record (the ⋯ of a row)
export const useRecordHistory = (
  entity: string,
  id: string,
  options: { enabled?: boolean; page?: number } = {},
) =>
  useQuery({
    queryKey: historyKeys.record(entity, id, options.page),
    queryFn: () => getRecordHistory(entity, id, options.page),
    staleTime: 0,
    enabled: options.enabled ?? true,
  });
