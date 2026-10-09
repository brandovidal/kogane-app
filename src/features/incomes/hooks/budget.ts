import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  createIncome,
  deleteIncome,
  getIncomes,
  updateIncome,
  type IncomeBodyDto,
} from "../services/income.service";
import type { Schemas } from "@/shared/api/client";

// Presupuesto (P19, D78): extra incomes of the month; they add to the salary in the surplus (D65)
export const budgetKeys = {
  incomes: (month: number, year: number) => ["incomes", month, year] as const,
};

export type Income = Schemas["IncomeResponseDto"]["data"];
export type IncomeBody = IncomeBodyDto;

export const useIncomes = (month: number, year: number) =>
  useQuery({
    queryKey: budgetKeys.incomes(month, year),
    queryFn: () => getIncomes({ month, year }),
  });

// An income moves the surplus of the month too
const afterIncome = [["incomes"], ["summary"]];

export const useSaveIncome = () =>
  useApiMutation(
    ({ id, body }: { id?: string; body: IncomeBody }) =>
      id ? updateIncome(id, body) : createIncome(body),
    { invalidate: afterIncome, success: "Ingreso guardado" },
  );

export const useDeleteIncome = () =>
  useApiMutation((id: string) => deleteIncome(id), {
    invalidate: afterIncome,
    success: "Ingreso borrado",
  });
