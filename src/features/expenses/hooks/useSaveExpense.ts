import type { ExpenseResource } from "@/shared/api/types";
import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import { expenseKeys } from "./expense-keys";
import { saveExpense } from "../services/expense.service";
import type { ExpenseInputDto } from "../services/dto/expense.dto";

export type { ExpenseInputDto as ExpenseInput } from "../services/dto/expense.dto";

const invalidateFor = (resource: ExpenseResource) => [
  expenseKeys.resource(resource),
  ["summary"],
  ...(resource === "credit-card-expenses" ? [["statements"] as const] : []),
  ...(resource === "fixed-costs" ? [["commitments"] as const] : []),
];

export const useSaveExpense = (resource: ExpenseResource) =>
  useApiMutation(
    ({ id, body }: { id?: string; body: ExpenseInputDto }) =>
      saveExpense(resource, { id, body }),
    { invalidate: invalidateFor(resource), success: "Guardado" },
  );
