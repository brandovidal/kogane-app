import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/shared/api/client";
import type { paths } from "@/shared/api/schema";

export const historyKeys = {
  all: ["history"] as const,
  list: (filter: HistoryFilter) => ["history", "list", filter] as const,
  record: (entity: string, id: string, page = 1) =>
    ["history", "record", entity, id, page] as const,
};

export type HistoryFilter = NonNullable<
  paths["/v1/history"]["get"]["parameters"]["query"]
>;

// Every change, newest first, filtered by table, source and dates (P29)
export const useHistory = (filter: HistoryFilter) =>
  useQuery({
    queryKey: historyKeys.list(filter),
    queryFn: () =>
      unwrap(api.GET("/v1/history", { params: { query: filter } })),
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
    queryFn: () =>
      unwrap(
        api.GET("/v1/history/{entity}/{id}", {
          params: { path: { entity, id }, query: { page: options.page } },
        }),
      ),
    staleTime: 0,
    enabled: options.enabled ?? true,
  });
