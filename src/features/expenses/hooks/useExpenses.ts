import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/shared/api/client";
import type { ExpenseByResource, ExpenseResource } from "@/shared/api/types";
import { expenseKeys, type SubscriptionGroup } from "./expense-keys";

export function useExpenses<R extends ExpenseResource>(
  resource: R,
  period?: { month: number; year: number },
  kind?: SubscriptionGroup,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: expenseKeys.list(resource, period?.month, period?.year, kind),
    queryFn: async () =>
      (await unwrap(
        api.GET("/v1/expenses/{resource}", {
          params: { path: { resource }, query: { ...period, kind } },
        }),
      )) as ExpenseByResource[R][],
  });
}
