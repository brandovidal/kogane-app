import { ApiError, api, apiFetch, unwrap } from "@/shared/api/client";
import type { ImportDetail } from "@/shared/api/types";
import type { ImportRowsParams, ListImportResult } from "../types/import-types";

export const getImports = () => unwrap(api.GET("/v1/imports"));
export const getImport = (id: string) =>
  unwrap(api.GET("/v1/imports/{id}", { params: { path: { id } } }));
export const getImportRows = (id: string, params: ImportRowsParams) =>
  unwrap(
    api.GET("/v1/imports/{id}/rows", {
      params: { path: { id }, query: { ...params, q: params.q || undefined } },
    }),
  );

export async function uploadNotionImport(files: File[]): Promise<ImportDetail> {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  const response = await apiFetch("/api/v1/imports/notion", {
    method: "POST",
    body: form,
    headers: { accept: "application/json" },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      response.status,
      body.code ?? "UNKNOWN_ERROR",
      body.message ?? response.statusText,
      body.details,
    );
  return body.data as ImportDetail;
}

export const applyImport = (id: string) =>
  unwrap(api.POST("/v1/imports/{id}/apply", { params: { path: { id } } }));
export const discardImport = (id: string) =>
  unwrap(api.DELETE("/v1/imports/{id}", { params: { path: { id } } }));

export type ListImportTarget =
  | "daily-expenses"
  | "platforms"
  | "recurring-expenses"
  | "receivables"
  | "payables";

// "Importar gastos… / plataformas… / recurrentes… / cuotas… / deudas…": a CSV with the columns of "Exportar lista (CSV)".
// Without `apply` the API only previews; with it, it creates the ready rows
export async function importList(input: {
  target: ListImportTarget;
  file: File;
  apply: boolean;
}) {
  const form = new FormData();
  form.set("file", input.file);
  const query = new URLSearchParams({ target: input.target });
  if (input.apply) query.set("apply", "true");
  const response = await apiFetch(`/api/v1/imports/list?${query}`, {
    method: "POST",
    body: form,
    headers: { accept: "application/json" },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      response.status,
      body.code ?? "UNKNOWN_ERROR",
      body.message ?? response.statusText,
      body.details,
    );
  return body.data as ListImportResult;
}
