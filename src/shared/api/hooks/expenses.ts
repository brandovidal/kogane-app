import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "../client";
import type { Schemas } from "../client";
import type { ExpenseByResource, ExpenseResource } from "../types";
import { useApiMutation } from "./use-api-mutation";

export const expenseKeys = {
  resource: (resource: ExpenseResource) => ["expenses", resource] as const,
  list: (resource: ExpenseResource, month?: number, year?: number, kind?: SubscriptionGroup) =>
    ["expenses", resource, month, year, kind] as const,
};

// Subscriptions split in two pages (D107): Plataformas and Recurrentes
export type SubscriptionGroup = "platform" | "recurring";

// One table of /v1/expenses (month and year filter by payment month, or by spent date for day-to-day expenses).
// The person is filtered on the page, with the rest of the filters (D80)
export function useExpenses<R extends ExpenseResource>(
  resource: R,
  period?: { month: number; year: number },
  kind?: SubscriptionGroup,
) {
  return useQuery({
    queryKey: expenseKeys.list(resource, period?.month, period?.year, kind),
    queryFn: async () =>
      (await unwrap(
        api.GET("/v1/expenses/{resource}", { params: { path: { resource }, query: { ...period, kind } } }),
      )) as ExpenseByResource[R][],
  });
}

// The columns depend on the table: each form validates its own and kogane-api validates them per resource
export type ExpenseInput = Record<string, unknown>;

// A change in a table also moves the month summary (Inicio, Resumen)
const invalidateFor = (resource: ExpenseResource) => [
  expenseKeys.resource(resource),
  ["summary"],
  ...(resource === "credit-card-expenses" ? [["statements"] as const] : []),
];

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

export type MoveSeries = Schemas["MoveSeriesDto"];

// "Pasar a…" (D106): with dryRun it only counts the series for the dialog; otherwise it moves it and refreshes both
// tables and the templates
export const useMoveSeries = () =>
  useApiMutation((body: MoveSeries) => unwrap(api.POST("/v1/expense-moves", { body })), {
    invalidate: [
      expenseKeys.resource("fixed-costs"),
      expenseKeys.resource("subscriptions"),
      expenseKeys.resource("recurring-expenses"),
      ["summary"],
    ],
  });
