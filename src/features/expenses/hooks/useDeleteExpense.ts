import { api, unwrap } from "@/shared/api/client";
import type { ExpenseResource } from "@/shared/api/types";
import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import { expenseKeys } from "./expense-keys";

export const useDeleteExpense = (resource: ExpenseResource) =>
  useApiMutation(
    (id: string) =>
      unwrap(
        api.DELETE("/v1/expenses/{resource}/{id}", {
          params: { path: { resource, id } },
        }),
      ),
    {
      invalidate: [expenseKeys.resource(resource), ["summary"]],
      success: "Eliminado",
    },
  );
