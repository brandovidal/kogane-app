import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "../client";
import { useApiMutation } from "./use-api-mutation";

// Presupuesto (P19, D78): extra incomes of the month; they add to the salary in the surplus (D65)
export const budgetKeys = {
  incomes: (month: number, year: number) => ["incomes", month, year] as const,
};

export type Income = Schemas["IncomeResponseDto"]["data"];
export type IncomeBody = Schemas["CreateIncomeDto"];

export const useIncomes = (month: number, year: number) =>
  useQuery({
    queryKey: budgetKeys.incomes(month, year),
    queryFn: () => unwrap(api.GET("/v1/incomes", { params: { query: { month, year } } })),
  });

// An income moves the surplus of the month too
const afterIncome = [["incomes"], ["summary"]];

export const useSaveIncome = () =>
  useApiMutation(
    ({ id, body }: { id?: string; body: IncomeBody }) =>
      id
        ? unwrap(api.PATCH("/v1/incomes/{id}", { params: { path: { id } }, body }))
        : unwrap(api.POST("/v1/incomes", { body })),
    { invalidate: afterIncome, success: "Ingreso guardado" },
  );

export const useDeleteIncome = () =>
  useApiMutation((id: string) => unwrap(api.DELETE("/v1/incomes/{id}", { params: { path: { id } } })), {
    invalidate: afterIncome,
    success: "Ingreso borrado",
  });
