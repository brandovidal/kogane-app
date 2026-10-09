import { api, unwrap } from "@/shared/api/client";
import type { DraftFieldsDto, DraftTab } from "../types/draft.dto";
export type { DraftFieldsDto, DraftTab } from "../types/draft.dto";

export const getDrafts = (tab: DraftTab, limit: number, offset = 0) =>
  unwrap(api.GET("/v1/drafts", { params: { query: { tab, limit, offset } } }));
export const getDraft = (id: string) =>
  unwrap(api.GET("/v1/drafts/{id}", { params: { path: { id } } }));
export const createDraft = (body: DraftFieldsDto) =>
  unwrap(api.POST("/v1/drafts", { body }));
export const updateDraft = (id: string, body: DraftFieldsDto) =>
  unwrap(api.PATCH("/v1/drafts/{id}", { params: { path: { id } }, body }));
export const saveDraft = (id: string) =>
  unwrap(api.POST("/v1/drafts/{id}/save", { params: { path: { id } } }));
export const discardDraft = (id: string) =>
  unwrap(api.POST("/v1/drafts/{id}/discard", { params: { path: { id } } }));
export const retryDraft = (id: string) =>
  unwrap(api.POST("/v1/drafts/{id}/retry", { params: { path: { id } } }));
