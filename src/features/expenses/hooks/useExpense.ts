import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/shared/api/client";
import type { ExpenseByResource, ExpenseResource } from "@/shared/api/types";
import { expenseKeys } from "./expense-keys";

export function useExpense<R extends ExpenseResource>(
  resource: R,
  id?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: expenseKeys.record(resource, id),
    enabled: enabled && !!id,
    queryFn: async () =>
      (await unwrap(
        api.GET("/v1/expenses/{resource}/{id}", {
          params: { path: { resource, id: id! } },
        }),
      )) as ExpenseByResource[R],
    staleTime: 0,
  });
}
