import type { ExpenseResource } from "@/shared/api/types";
import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import { expenseKeys } from "./expense-keys";
import { deleteExpense } from "../services/expense.service";

export const useDeleteExpense = (resource: ExpenseResource) =>
  useApiMutation((id: string) => deleteExpense(resource, id), {
    invalidate: [expenseKeys.resource(resource), ["summary"]],
    success: "Eliminado",
  });
