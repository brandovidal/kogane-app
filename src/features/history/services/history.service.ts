import { api, unwrap } from "@/shared/api/client";
import type { HistoryFilter } from "../types/history.dto";
export type { HistoryFilter } from "../types/history.dto";

export const getHistory = (query: HistoryFilter) =>
  unwrap(api.GET("/v1/history", { params: { query } }));

export const getRecordHistory = (entity: string, id: string, page?: number) =>
  unwrap(
    api.GET("/v1/history/{entity}/{id}", {
      params: { path: { entity, id }, query: { page } },
    }),
  );
