import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  assignStatementRows,
  createStatementRows,
  deleteStatement,
  getStatement,
  getStatements,
  updateStatement,
  updateStatementRow,
  uploadStatement,
  type UpdateRowDto,
} from "../services/statement.service";

export const statementKeys = {
  all: ["statements"] as const,
  list: ["statements", "list"] as const,
  detail: (id: string) => ["statements", "detail", id] as const,
};

// A statement changes card expenses, the calendar and the month summary
const invalidate = [
  statementKeys.all,
  ["expenses"],
  ["debts"],
  ["calendar"],
  ["summary"],
];

export const useStatements = () =>
  useQuery({
    queryKey: statementKeys.list,
    queryFn: getStatements,
  });

export const useStatement = (id: string | null) =>
  useQuery({
    queryKey: statementKeys.detail(id ?? ""),
    queryFn: () => getStatement(id!),
    enabled: !!id,
  });

export type { StatementUploadInput } from "../services/statement.service";

// Multipart through the /api proxy: the PDF, and the password or the card only when the first try asked for them.
// The errors come back to the form (STATEMENT_PASSWORD, STATEMENT_UNREADABLE) instead of a toast
export function useUploadStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadStatement,
    onSuccess: async () => {
      await Promise.all(
        invalidate.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      toast.success("Estado de cuenta leído");
    },
  });
}

export const useCreateStatementRows = () =>
  useApiMutation(
    ({ id, rowIds }: { id: string; rowIds?: string[] }) =>
      createStatementRows(id, rowIds),
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
    }) => updateStatementRow(id, rowId, body as UpdateRowDto),
    { invalidate },
  );

// Selección múltiple (D116): several purchases to a person (the additional card or who pays it); null = the statement's
export const useAssignStatementRows = () =>
  useApiMutation(
    ({
      id,
      rowIds,
      personId,
    }: {
      id: string;
      rowIds: string[];
      personId: string | null;
    }) => assignStatementRows(id, { rowIds, personId }),
    { invalidate, success: "Persona asignada" },
  );

// Whose statement it is, when the PDF did not say or said someone else
export const useAssignStatementPerson = () =>
  useApiMutation(
    ({ id, personId }: { id: string; personId: string }) =>
      updateStatement(id, { personId }),
    { invalidate, success: "Persona asignada" },
  );

// Corrects the card (Oh Pay / IO / CMR…) when it was not identified right, without re-uploading the PDF: re-reconciles
// the rows not yet turned into an expense against the new card
export const useAssignStatementCard = () =>
  useApiMutation(
    ({ id, paymentMethodId }: { id: string; paymentMethodId: string }) =>
      updateStatement(id, { paymentMethodId }),
    { invalidate, success: "Tarjeta corregida" },
  );

export const useUpdateStatementMinimum = () =>
  useApiMutation(
    ({
      id,
      ...body
    }: {
      id: string;
      currency?: "PEN" | "USD";
      minimumDue?: number | null;
      minimumAllocations?: Record<string, number> | null;
    }) => updateStatement(id, body),
    {
      invalidate: [statementKeys.all, ["debts"]],
      success: "Pago mínimo actualizado",
    },
  );

export interface UpdateStatementBalanceInput {
  currency: "PEN" | "USD";
  totalDue: number | null;
  minimumDue: number | null;
  previousBalance: number | null;
  previousPayments: number | null;
  monthlyPayment: number | null;
}

export const useUpdateStatementBalances = () =>
  useApiMutation(
    ({
      id,
      balances,
    }: {
      id: string;
      balances: UpdateStatementBalanceInput[];
    }) => updateStatement(id, { balances }),
    { invalidate, success: "Saldos actualizados" },
  );

export const useDeleteStatement = () =>
  useApiMutation((id: string) => deleteStatement(id), {
    invalidate,
    success: "Estado de cuenta eliminado",
  });
