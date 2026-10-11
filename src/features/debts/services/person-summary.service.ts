import { api, unwrap } from "@/shared/api/client";
import type {
  BulkPersonSummaryStatusDto,
  SavePersonSummaryDto,
} from "../types/person-summary.dto";

export const getPersonSummaries = (query: { month: number; year: number }) =>
  unwrap(api.GET("/v1/person-summaries", { params: { query } }));

export const savePersonSummary = (
  personId: string,
  body: SavePersonSummaryDto,
) =>
  unwrap(
    api.PUT("/v1/person-summaries/{personId}", {
      params: { path: { personId } },
      body,
    }),
  );

export const setPersonSummariesStatus = (body: BulkPersonSummaryStatusDto) =>
  unwrap(api.POST("/v1/person-summaries/status", { body }));
