import { ApiError, api, apiFetch, unwrap } from "@/shared/api/client";
import type { ImportDetail } from "@/shared/api/types";
import type { ImportRowsParams } from "../types/import-types";

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
