import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "../client";
import type { paths } from "../schema";

export const historyKeys = {
  all: ["history"] as const,
  list: (filter: HistoryFilter) => ["history", "list", filter] as const,
  record: (entity: string, id: string) => ["history", "record", entity, id] as const,
};

export type HistoryFilter = NonNullable<paths["/v1/history"]["get"]["parameters"]["query"]>;

// Every change, newest first, filtered by table, source and dates (P29)
export const useHistory = (filter: HistoryFilter) =>
  useQuery({
    queryKey: historyKeys.list(filter),
    queryFn: () => unwrap(api.GET("/v1/history", { params: { query: filter } })),
    staleTime: 0,
  });

// The timeline of one record (the ⋯ of a row)
export const useRecordHistory = (entity: string, id: string) =>
  useQuery({
    queryKey: historyKeys.record(entity, id),
    queryFn: () => unwrap(api.GET("/v1/history/{entity}/{id}", { params: { path: { entity, id } } })),
    staleTime: 0,
  });
