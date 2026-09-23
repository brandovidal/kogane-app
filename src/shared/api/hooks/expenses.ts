import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "../client";
import type { ExpenseByResource, ExpenseResource } from "../types";
import { useApiMutation } from "./use-api-mutation";

export const expenseKeys = {
  resource: (resource: ExpenseResource) => ["expenses", resource] as const,
  list: (resource: ExpenseResource, month?: number, year?: number) => ["expenses", resource, month, year] as const,
};

// One table of /v1/expenses (month and year filter by payment month, or by spent date for day-to-day expenses)
export function useExpenses<R extends ExpenseResource>(resource: R, period?: { month: number; year: number }) {
  return useQuery({
    queryKey: expenseKeys.list(resource, period?.month, period?.year),
    queryFn: async () =>
      (await unwrap(
        api.GET("/v1/expenses/{resource}", { params: { path: { resource }, query: period } }),
      )) as ExpenseByResource[R][],
  });
}

// The columns depend on the table: each form validates its own and kogane-api validates them per resource
export type ExpenseInput = Record<string, unknown>;

// A change in a table also moves the month summary (Inicio, Resumen)
const invalidateFor = (resource: ExpenseResource) => [expenseKeys.resource(resource), ["summary"]];

export const useSaveExpense = (resource: ExpenseResource) =>
  useApiMutation(
    ({ id, body }: { id?: string; body: ExpenseInput }) =>
      id
        ? unwrap(api.PATCH("/v1/expenses/{resource}/{id}", { params: { path: { resource, id } }, body: body as never }))
        : unwrap(api.POST("/v1/expenses/{resource}", { params: { path: { resource } }, body: body as never })),
    { invalidate: invalidateFor(resource), success: "Guardado" },
  );

export const useDeleteExpense = (resource: ExpenseResource) =>
  useApiMutation(
    (id: string) => unwrap(api.DELETE("/v1/expenses/{resource}/{id}", { params: { path: { resource, id } } })),
    { invalidate: invalidateFor(resource), success: "Eliminado" },
  );
