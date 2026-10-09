import { useQuery } from "@tanstack/react-query";
import type { ExpenseResource } from "@/shared/api/types";
import { expenseKeys } from "./expense-keys";
import { getExpense } from "../services/expense.service";

export function useExpense<R extends ExpenseResource>(
  resource: R,
  id?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: expenseKeys.record(resource, id),
    enabled: enabled && !!id,
    queryFn: () => getExpense(resource, id!),
    staleTime: 0,
  });
}
