import { api, unwrap } from "@/shared/api/client";
import type { ExpenseResource } from "@/shared/api/types";
import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import { expenseKeys } from "./expense-keys";

export type ExpenseInput = Record<string, unknown>;

const invalidateFor = (resource: ExpenseResource) => [
  expenseKeys.resource(resource),
  ["summary"],
  ...(resource === "credit-card-expenses" ? [["statements"] as const] : []),
  ...(resource === "fixed-costs" ? [["commitments"] as const] : []),
];

export const useSaveExpense = (resource: ExpenseResource) =>
  useApiMutation(
    ({ id, body }: { id?: string; body: ExpenseInput }) =>
      id
        ? unwrap(
            api.PATCH("/v1/expenses/{resource}/{id}", {
              params: { path: { resource, id } },
              body: body as never,
            }),
          )
        : unwrap(
            api.POST("/v1/expenses/{resource}", {
              params: { path: { resource } },
              body: body as never,
            }),
          ),
    { invalidate: invalidateFor(resource), success: "Guardado" },
  );
