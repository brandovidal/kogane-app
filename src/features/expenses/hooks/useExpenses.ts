import { useQuery } from "@tanstack/react-query";
import type { ExpenseResource } from "@/shared/api/types";
import { expenseKeys, type SubscriptionGroup } from "./expense-keys";
import { getExpenses } from "../services/expense.service";

export function useExpenses<R extends ExpenseResource>(
  resource: R,
  period?: { month: number; year: number },
  kind?: SubscriptionGroup,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: expenseKeys.list(resource, period?.month, period?.year, kind),
    queryFn: () => getExpenses(resource, { ...period, kind }),
  });
}
