import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "../client";
import type { paths } from "../schema";
import { useApiMutation } from "./use-api-mutation";

export const debtKeys = {
  all: ["debts"] as const,
  list: (filter: DebtFilter) => ["debts", "list", filter] as const,
  summary: ["debts", "summary"] as const,
};

type DebtFilter = NonNullable<paths["/v1/debts"]["get"]["parameters"]["query"]>;

// One row per installment, oldest first, with balance and timing (P17, D60)
export const useDebts = (filter: DebtFilter = {}) =>
  useQuery({
    queryKey: debtKeys.list(filter),
    queryFn: () => unwrap(api.GET("/v1/debts", { params: { query: filter } })),
  });

export const useDebtSummary = () =>
  useQuery({ queryKey: debtKeys.summary, queryFn: () => unwrap(api.GET("/v1/debts/summary")) });

const invalidate = [debtKeys.all, ["summary"]];

export const useCreateDebt = () =>
  useApiMutation((body: Schemas["CreateDebtDto"]) => unwrap(api.POST("/v1/debts", { body })), {
    invalidate,
    success: "Deuda guardada",
  });

export const useUpdateDebt = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: Schemas["UpdateDebtDto"] }) =>
      unwrap(api.PATCH("/v1/debts/{id}", { params: { path: { id } }, body })),
    { invalidate, success: "Deuda guardada" },
  );

export const useDeleteDebt = () =>
  useApiMutation((id: string) => unwrap(api.DELETE("/v1/debts/{id}", { params: { path: { id } } })), {
    invalidate,
    success: "Cuota eliminada",
  });

export const useAddDebtPayment = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: Schemas["DebtPaymentDto"] }) =>
      unwrap(api.POST("/v1/debts/{id}/payments", { params: { path: { id } }, body })),
    { invalidate, success: "Abono guardado" },
  );

// Excel / PDF of the debts (D39), downloaded through the /api proxy: everyone, or one person
export function debtReportUrl(format: "xlsx" | "pdf", personId?: string): string {
  const query = new URLSearchParams({ format, ...(personId ? { personId } : {}) });
  return `/api/v1/reports/debts?${query}`;
}
