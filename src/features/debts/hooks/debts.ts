import { useQueries, useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  addDebtPayment,
  bulkDebts,
  createDebt,
  deleteDebt,
  getCardCheck,
  getDebt,
  getDebts,
  updateDebt,
  type CardCheckQuery,
  type CreateDebtDto,
  type DebtBulkDto,
  type DebtPaymentDto,
  type DebtQuery,
  type UpdateDebtDto,
} from "../services/debt.service";

export const debtKeys = {
  all: ["debts"] as const,
  list: (filter: DebtFilter) => ["debts", "list", filter] as const,
  cardCheck: (query: CardCheckQuery) => ["debts", "card-check", query] as const,
};

type DebtFilter = DebtQuery;
export type DebtBulk = DebtBulkDto;

// One row per installment, oldest first, with balance and timing (P17, D60)
export const useDebts = (filter: DebtFilter = {}) =>
  useQuery({
    queryKey: debtKeys.list(filter),
    queryFn: () => getDebts(filter),
  });

export const useDebt = (id: string | null) =>
  useQuery({
    queryKey: ["debts", "detail", id ?? ""],
    queryFn: () => getDebt(id!),
    enabled: !!id,
  });

// Contraste con la tarjeta (D114): only when a card and a month are chosen
export const useCardCheck = (query: CardCheckQuery | null) =>
  useQuery({
    queryKey: debtKeys.cardCheck(
      query ?? { paymentMethodId: "", month: 0, year: 0 },
    ),
    queryFn: () => getCardCheck(query!),
    enabled: !!query,
  });

export const useCardChecks = (
  paymentMethodIds: string[],
  month: number,
  year: number,
) =>
  useQueries({
    queries: paymentMethodIds.map((paymentMethodId) => {
      const query = { paymentMethodId, month, year };
      return {
        queryKey: debtKeys.cardCheck(query),
        queryFn: () => getCardCheck(query),
      };
    }),
  });

const invalidate = [debtKeys.all, ["summary"]];

export const useCreateDebt = () =>
  useApiMutation((body: CreateDebtDto) => createDebt(body), {
    invalidate,
    success: "Deuda guardada",
  });

export const useUpdateDebt = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: UpdateDebtDto }) => updateDebt(id, body),
    { invalidate, success: "Deuda actualizada" },
  );

export const useDeleteDebt = () =>
  useApiMutation((id: string) => deleteDebt(id), {
    invalidate,
    success: "Cuota eliminada",
  });

export const useAddDebtPayment = () =>
  useApiMutation(
    ({ id, body }: { id: string; body: DebtPaymentDto }) =>
      addDebtPayment(id, body),
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
  useApiMutation((body: DebtBulk) => bulkDebts(body), {
    invalidate,
    success: (result) => {
      const skipped = result.skipped.length
        ? ` · ${result.skipped.length} sin cambios`
        : "";
      return `${BULK_MESSAGES[result.action]}: ${result.affected}${skipped}`;
    },
  });
