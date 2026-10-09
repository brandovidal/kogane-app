import { ApiError, api, apiFetch, unwrap } from "@/shared/api/client";
import type { Statement } from "@/shared/api/types";
import type {
  AssignRowsDto,
  StatementUploadDto,
  UpdateRowDto,
  UpdateStatementDto,
} from "../types/statement.dto";
export type {
  AssignRowsDto,
  StatementUploadDto as StatementUploadInput,
  UpdateRowDto,
  UpdateStatementDto,
} from "../types/statement.dto";

export const getStatements = () => unwrap(api.GET("/v1/statements"));
export const getStatement = (id: string) =>
  unwrap(api.GET("/v1/statements/{id}", { params: { path: { id } } }));

export async function uploadStatement({
  file,
  password,
  paymentMethodId,
  personId,
  savePassword,
  signal,
}: StatementUploadDto): Promise<Statement> {
  const form = new FormData();
  form.set("file", file);
  if (password) form.set("password", password);
  if (paymentMethodId) form.set("paymentMethodId", paymentMethodId);
  if (personId) form.set("personId", personId);
  if (password && savePassword) form.set("savePassword", "true");
  const response = await apiFetch("/api/v1/statements", {
    method: "POST",
    body: form,
    signal,
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
  return body.data as Statement;
}

export const createStatementRows = (id: string, rowIds?: string[]) =>
  unwrap(
    api.POST("/v1/statements/{id}/create-new", {
      params: { path: { id } },
      body: { rowIds },
    }),
  );
export const updateStatementRow = (
  id: string,
  rowId: string,
  body: UpdateRowDto,
) =>
  unwrap(
    api.PATCH("/v1/statements/{id}/rows/{rowId}", {
      params: { path: { id, rowId } },
      body,
    }),
  );
export const assignStatementRows = (id: string, body: AssignRowsDto) =>
  unwrap(
    api.POST("/v1/statements/{id}/rows/assign", {
      params: { path: { id } },
      body,
    }),
  );
export const updateStatement = (id: string, body: UpdateStatementDto) =>
  unwrap(api.PATCH("/v1/statements/{id}", { params: { path: { id } }, body }));
export const deleteStatement = (id: string) =>
  unwrap(api.DELETE("/v1/statements/{id}", { params: { path: { id } } }));
