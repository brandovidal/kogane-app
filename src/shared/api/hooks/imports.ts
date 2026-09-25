import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, api, unwrap } from "../client";
import type { ImportDetail, ImportRowStatus, ImportTab } from "../types";
import { useApiMutation } from "./use-api-mutation";

export const importKeys = {
  all: ["imports"] as const,
  list: ["imports", "list"] as const,
  detail: (id: string) => ["imports", "detail", id] as const,
  rows: (id: string, params: ImportRowsParams) => ["imports", "rows", id, params] as const,
};

export interface ImportRowsParams {
  tab: ImportTab;
  status?: ImportRowStatus;
  q?: string;
  page: number;
}

export const useImports = () => useQuery({ queryKey: importKeys.list, queryFn: () => unwrap(api.GET("/v1/imports")) });

export const useImport = (id: string | null) =>
  useQuery({
    queryKey: importKeys.detail(id ?? ""),
    queryFn: () => unwrap(api.GET("/v1/imports/{id}", { params: { path: { id: id! } } })),
    enabled: !!id,
  });

// One page of a tab; the previous page stays on screen while the next one loads
export const useImportRows = (id: string, params: ImportRowsParams) =>
  useQuery({
    queryKey: importKeys.rows(id, params),
    queryFn: () =>
      unwrap(
        api.GET("/v1/imports/{id}/rows", {
          params: { path: { id }, query: { ...params, q: params.q || undefined } },
        }),
      ),
    placeholderData: keepPreviousData,
  });

// Multipart through the /api proxy: the ZIP of Notion or its CSV files. It only saves a preview
export function useUploadNotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]): Promise<ImportDetail> => {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));
      const response = await fetch("/api/v1/imports/notion", { method: "POST", body: form, headers: { accept: "application/json" } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new ApiError(response.status, body.code ?? "UNKNOWN_ERROR", body.message ?? response.statusText, body.details);
      }
      return body.data as ImportDetail;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: importKeys.all });
      toast.success("Listo para revisar: todavía no se guardó nada");
    },
  });
}

// Applying writes expenses, debts, the budget and the calendar
export const useApplyImport = () =>
  useApiMutation((id: string) => unwrap(api.POST("/v1/imports/{id}/apply", { params: { path: { id } } })), {
    invalidate: [importKeys.all, ["expenses"], ["debts"], ["budget"], ["summary"], ["calendar"]],
    success: "Importado",
  });

export const useDiscardImport = () =>
  useApiMutation((id: string) => unwrap(api.DELETE("/v1/imports/{id}", { params: { path: { id } } })), {
    invalidate: [importKeys.all],
    success: "Previsualización descartada",
  });
