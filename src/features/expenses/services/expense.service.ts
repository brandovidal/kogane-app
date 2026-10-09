import { api, unwrap } from "@/shared/api/client";
import type { ExpenseByResource, ExpenseResource } from "@/shared/api/types";
import type {
  ExpenseInputDto,
  ExpenseListQuery,
  MoveSeriesDto,
} from "./dto/expense.dto";

export async function getExpenses<R extends ExpenseResource>(
  resource: R,
  query: ExpenseListQuery = {},
): Promise<ExpenseByResource[R][]> {
  return (await unwrap(
    api.GET("/v1/expenses/{resource}", {
      params: { path: { resource }, query },
    }),
  )) as ExpenseByResource[R][];
}

export async function getExpense<R extends ExpenseResource>(
  resource: R,
  id: string,
): Promise<ExpenseByResource[R]> {
  return (await unwrap(
    api.GET("/v1/expenses/{resource}/{id}", {
      params: { path: { resource, id } },
    }),
  )) as ExpenseByResource[R];
}

export async function saveExpense(
  resource: ExpenseResource,
  input: { id?: string; body: ExpenseInputDto },
) {
  if (input.id)
    return unwrap(
      api.PATCH("/v1/expenses/{resource}/{id}", {
        params: { path: { resource, id: input.id } },
        body: input.body as never,
      }),
    );

  return unwrap(
    api.POST("/v1/expenses/{resource}", {
      params: { path: { resource } },
      body: input.body as never,
    }),
  );
}

export function deleteExpense(resource: ExpenseResource, id: string) {
  return unwrap(
    api.DELETE("/v1/expenses/{resource}/{id}", {
      params: { path: { resource, id } },
    }),
  );
}

export function previewMoveSeries(input: MoveSeriesDto) {
  return unwrap(
    api.POST("/v1/expense-moves", { body: { ...input, dryRun: true } }),
  );
}

export function moveSeries(input: MoveSeriesDto) {
  return unwrap(api.POST("/v1/expense-moves", { body: input }));
}
