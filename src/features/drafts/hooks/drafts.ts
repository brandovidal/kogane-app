import { useQueries, useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  createDraft,
  discardDraft,
  getDrafts,
  retryDraft,
  saveDraft,
  updateDraft,
  type DraftFieldsDto,
  type DraftTab,
} from "../services/draft.service";

export type { DraftTab } from "../services/draft.service";
export type DraftFields = DraftFieldsDto;

export const draftKeys = {
  all: ["drafts"] as const,
  list: (tab: DraftTab) => ["drafts", "list", tab] as const,
};

// Borrador (D50): everything pending review, from the bot, the web chat or the form
export const useDrafts = (tab: DraftTab, limit = 50) =>
  useQuery({
    queryKey: draftKeys.list(tab),
    queryFn: () => getDrafts(tab, limit),
  });

// The counter of the menu: only the total of "Por revisar"
export const useDraftCount = () =>
  useQuery({
    queryKey: [...draftKeys.list("review"), "count"],
    queryFn: async () => (await getDrafts("review", 1)).total,
    refetchInterval: 60_000,
  });

// Counters of the three tabs (the list of each tab is loaded on its own)
const DRAFT_TABS: DraftTab[] = ["review", "failed", "discarded"];
export const useDraftTabCounts = () => {
  const results = useQueries({
    queries: DRAFT_TABS.map((tab) => ({
      queryKey: [...draftKeys.list(tab), "count"],
      queryFn: async () => (await getDrafts(tab, 1)).total,
    })),
  });
  return Object.fromEntries(
    DRAFT_TABS.map((tab, index) => [tab, results[index].data]),
  ) as Record<DraftTab, number | undefined>;
};

// A saved draft is a new record: every table and the summary may change
const afterSave = [draftKeys.all, ["expenses"], ["summary"], ["debts"]];

export const useCreateDraft = () =>
  useApiMutation((body: DraftFields) => createDraft(body), {
    invalidate: [draftKeys.all],
  });

export const useUpdateDraft = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: DraftFields }) => updateDraft(id, body),
    { invalidate: [draftKeys.all] },
  );

// `quiet`: the caller shows its own message (Nuevo gasto says where it went)
export const useSaveDraft = ({ quiet = false }: { quiet?: boolean } = {}) =>
  useApiMutation((id: string) => saveDraft(id), {
    invalidate: afterSave,
    ...(quiet ? {} : { success: "Guardado" }),
  });

export const useDiscardDraft = ({ quiet = false }: { quiet?: boolean } = {}) =>
  useApiMutation((id: string) => discardDraft(id), {
    invalidate: [draftKeys.all],
    ...(quiet ? {} : { success: "Descartado" }),
  });

export const useRetryDraft = () =>
  useApiMutation((id: string) => retryDraft(id), {
    invalidate: [draftKeys.all],
    success: "Reintentado",
  });
