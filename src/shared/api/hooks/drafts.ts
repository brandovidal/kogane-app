import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "../client";
import { useApiMutation } from "./use-api-mutation";

export type DraftTab = "review" | "failed" | "discarded";
export type DraftFields = Schemas["DraftFieldsDto"];

export const draftKeys = {
  all: ["drafts"] as const,
  list: (tab: DraftTab) => ["drafts", "list", tab] as const,
  detail: (id: string) => ["drafts", "detail", id] as const,
};

// Borrador (D50): everything pending review, from the bot, the web chat or the form
export const useDrafts = (tab: DraftTab, limit = 50) =>
  useQuery({
    queryKey: draftKeys.list(tab),
    queryFn: () => unwrap(api.GET("/v1/drafts", { params: { query: { tab, limit, offset: 0 } } })),
  });

// The counter of the menu: only the total of "Por revisar"
export const useDraftCount = () =>
  useQuery({
    queryKey: [...draftKeys.list("review"), "count"],
    queryFn: async () => (await unwrap(api.GET("/v1/drafts", { params: { query: { tab: "review", limit: 1, offset: 0 } } }))).total,
    refetchInterval: 60_000,
  });

// With a signed link of 10 minutes to its screenshot or voice note (D58)
export const useDraft = (id: string | undefined) =>
  useQuery({
    queryKey: draftKeys.detail(id ?? ""),
    queryFn: () => unwrap(api.GET("/v1/drafts/{id}", { params: { path: { id: id! } } })),
    enabled: !!id,
  });

// A saved draft is a new record: every table and the summary may change
const afterSave = [draftKeys.all, ["expenses"], ["summary"], ["debts"]];

export const useCreateDraft = () =>
  useApiMutation((body: DraftFields) => unwrap(api.POST("/v1/drafts", { body })), { invalidate: [draftKeys.all] });

export const useUpdateDraft = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: DraftFields }) =>
      unwrap(api.PATCH("/v1/drafts/{id}", { params: { path: { id } }, body })),
    { invalidate: [draftKeys.all] },
  );

export const useSaveDraft = () =>
  useApiMutation((id: string) => unwrap(api.POST("/v1/drafts/{id}/save", { params: { path: { id } } })), {
    invalidate: afterSave,
    success: "Guardado",
  });

export const useDiscardDraft = () =>
  useApiMutation((id: string) => unwrap(api.POST("/v1/drafts/{id}/discard", { params: { path: { id } } })), {
    invalidate: [draftKeys.all],
    success: "Descartado",
  });

export const useRetryDraft = () =>
  useApiMutation((id: string) => unwrap(api.POST("/v1/drafts/{id}/retry", { params: { path: { id } } })), {
    invalidate: [draftKeys.all],
    success: "Reintentado",
  });

// "Nuevo gasto": the AI reads a typed or pasted text and returns the fields to prefill (D40)
export const useExtractExpense = () =>
  useApiMutation((text: string) => unwrap(api.POST("/v1/expenses/extract", { body: { text } })), { invalidate: [] });
