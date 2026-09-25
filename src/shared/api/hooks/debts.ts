import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "../client";
import type { paths } from "../schema";
import { useApiMutation } from "./use-api-mutation";

export const debtKeys = {
  all: ["debts"] as const,
  list: (filter: DebtFilter) => ["debts", "list", filter] as const,
  summary: (filter: SummaryFilter = {}) => ["debts", "summary", filter] as const,
  cardCheck: (query: CardCheckQuery) => ["debts", "card-check", query] as const,
};

type SummaryFilter = NonNullable<paths["/v1/debts/summary"]["get"]["parameters"]["query"]>;
type CardCheckQuery = paths["/v1/debts/card-check"]["get"]["parameters"]["query"];
export type DebtBulk = Schemas["DebtBulkDto"];

type DebtFilter = NonNullable<paths["/v1/debts"]["get"]["parameters"]["query"]>;

// One row per installment, oldest first, with balance and timing (P17, D60)
export const useDebts = (filter: DebtFilter = {}) =>
  useQuery({
    queryKey: debtKeys.list(filter),
    queryFn: () => unwrap(api.GET("/v1/debts", { params: { query: filter } })),
  });

// Me deben · debo · neto per person; with a month, only that one (or until it)
export const useDebtSummary = (filter: SummaryFilter = {}) =>
  useQuery({
    queryKey: debtKeys.summary(filter),
    queryFn: () => unwrap(api.GET("/v1/debts/summary", { params: { query: filter } })),
  });

// Contraste con la tarjeta (D114): only when a card and a month are chosen
export const useCardCheck = (query: CardCheckQuery | null) =>
  useQuery({
    queryKey: debtKeys.cardCheck(query ?? { paymentMethodId: "", month: 0, year: 0 }),
    queryFn: () => unwrap(api.GET("/v1/debts/card-check", { params: { query: query! } })),
    enabled: !!query,
  });

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

const BULK_MESSAGES: Record<DebtBulk["action"], string> = {
  pay: "Pagadas",
  prepaid: "Amortizadas",
  cashback: "Registradas con cashback",
  partial: "Abono registrado",
  clone: "Clonadas",
  reset: "Vueltas a No iniciado",
  card: "Tarjeta asignada",
  delete: "Eliminadas",
};

// Selección múltiple (D115): the toast says how many and what was left out
export const useBulkDebts = () =>
  useApiMutation((body: DebtBulk) => unwrap(api.POST("/v1/debts/bulk", { body })), {
    invalidate,
    success: (result) => {
      const skipped = result.skipped.length ? ` · ${result.skipped.length} sin cambios` : "";
      return `${BULK_MESSAGES[result.action]}: ${result.affected}${skipped}`;
    },
  });

// Excel / PDF of the debts (D39), downloaded through the /api proxy: everyone or one person, one direction and month
export function debtReportUrl(
  format: "xlsx" | "pdf",
  personId?: string,
  filter: { direction?: "owed_to_me" | "i_owe"; month?: number; year?: number } = {},
): string {
  const query = new URLSearchParams({ format, ...(personId ? { personId } : {}) });
  if (filter.direction) query.set("direction", filter.direction);
  if (filter.month) query.set("month", String(filter.month));
  if (filter.year) query.set("year", String(filter.year));
  return `/api/v1/reports/debts?${query}`;
}
