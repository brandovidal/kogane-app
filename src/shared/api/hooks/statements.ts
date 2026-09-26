import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, api, apiFetch, unwrap } from "../client";
import type { Statement } from "../types";
import { useApiMutation } from "./use-api-mutation";

export const statementKeys = {
  all: ["statements"] as const,
  list: ["statements", "list"] as const,
  detail: (id: string) => ["statements", "detail", id] as const,
};

// A statement changes card expenses, the calendar and the month summary
const invalidate = [statementKeys.all, ["expenses"], ["calendar"], ["summary"]];

export const useStatements = () =>
  useQuery({ queryKey: statementKeys.list, queryFn: () => unwrap(api.GET("/v1/statements")) });

export const useStatement = (id: string | null) =>
  useQuery({
    queryKey: statementKeys.detail(id ?? ""),
    queryFn: () => unwrap(api.GET("/v1/statements/{id}", { params: { path: { id: id! } } })),
    enabled: !!id,
  });

export interface StatementUploadInput {
  file: File;
  password?: string;
  paymentMethodId?: string;
  personId?: string;
  savePassword?: boolean; // keep the typed password as the person's document number (D94)
}

// Multipart through the /api proxy: the PDF, and the password or the card only when the first try asked for them.
// The errors come back to the form (STATEMENT_PASSWORD, STATEMENT_UNREADABLE) instead of a toast
export function useUploadStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, password, paymentMethodId, personId, savePassword }: StatementUploadInput): Promise<Statement> => {
      const form = new FormData();
      form.set("file", file);
      if (password) form.set("password", password);
      if (paymentMethodId) form.set("paymentMethodId", paymentMethodId);
      if (personId) form.set("personId", personId);
      if (password && savePassword) form.set("savePassword", "true");
      const response = await apiFetch("/api/v1/statements", { method: "POST", body: form, headers: { accept: "application/json" } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new ApiError(response.status, body.code ?? "UNKNOWN_ERROR", body.message ?? response.statusText, body.details);
      }
      return body.data as Statement;
    },
    onSuccess: async () => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      toast.success("Estado de cuenta leído");
    },
  });
}

export const useCreateStatementRows = () =>
  useApiMutation(
    ({ id, rowIds }: { id: string; rowIds?: string[] }) =>
      unwrap(api.POST("/v1/statements/{id}/create-new", { params: { path: { id } }, body: { rowIds } })),
    { invalidate, success: "Gastos creados" },
  );

// Ignore a row, bring it back, or give it your description (null goes back to the bank text)
export const useUpdateStatementRow = () =>
  useApiMutation(
    ({
      id,
      rowId,
      ...body
    }: {
      id: string;
      rowId: string;
      result?: "ignored" | "new";
      label?: string | null;
      personId?: string | null; // who made the purchase (D113); null = the statement's person
    }) =>
      unwrap(api.PATCH("/v1/statements/{id}/rows/{rowId}", { params: { path: { id, rowId } }, body })),
    { invalidate: [statementKeys.all] },
  );

// Selección múltiple (D116): several purchases to a person (the additional card or who pays it); null = the statement's
export const useAssignStatementRows = () =>
  useApiMutation(
    ({ id, rowIds, personId }: { id: string; rowIds: string[]; personId: string | null }) =>
      unwrap(api.POST("/v1/statements/{id}/rows/assign", { params: { path: { id } }, body: { rowIds, personId } })),
    { invalidate: [statementKeys.all], success: "Persona asignada" },
  );

// Whose statement it is, when the PDF did not say or said someone else
export const useAssignStatementPerson = () =>
  useApiMutation(
    ({ id, personId }: { id: string; personId: string }) =>
      unwrap(api.PATCH("/v1/statements/{id}", { params: { path: { id } }, body: { personId } })),
    { invalidate: [statementKeys.all], success: "Persona asignada" },
  );

export const useDeleteStatement = () =>
  useApiMutation(
    (id: string) => unwrap(api.DELETE("/v1/statements/{id}", { params: { path: { id } } })),
    { invalidate: [statementKeys.all, ["calendar"]], success: "Estado de cuenta eliminado" },
  );
