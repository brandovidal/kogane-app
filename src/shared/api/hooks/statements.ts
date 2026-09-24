import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, api, unwrap } from "../client";
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
}

// Multipart through the /api proxy: the PDF, and the password or the card only when the first try asked for them.
// The errors come back to the form (STATEMENT_PASSWORD, STATEMENT_UNREADABLE) instead of a toast
export function useUploadStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, password, paymentMethodId }: StatementUploadInput): Promise<Statement> => {
      const form = new FormData();
      form.set("file", file);
      if (password) form.set("password", password);
      if (paymentMethodId) form.set("paymentMethodId", paymentMethodId);
      const response = await fetch("/api/v1/statements", { method: "POST", body: form, headers: { accept: "application/json" } });
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

export const useSetStatementRow = () =>
  useApiMutation(
    ({ id, rowId, result }: { id: string; rowId: string; result: "ignored" | "new" }) =>
      unwrap(api.PATCH("/v1/statements/{id}/rows/{rowId}", { params: { path: { id, rowId } }, body: { result } })),
    { invalidate: [statementKeys.all] },
  );

export const useDeleteStatement = () =>
  useApiMutation(
    (id: string) => unwrap(api.DELETE("/v1/statements/{id}", { params: { path: { id } } })),
    { invalidate: [statementKeys.all, ["calendar"]], success: "Estado de cuenta eliminado" },
  );

