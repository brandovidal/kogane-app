import { api, unwrap } from "@/shared/api/client";
import type {
  IncomeBodyDto,
  IncomePatchDto,
  IncomeQuery,
} from "../types/income.dto";
export type {
  IncomeBodyDto,
  IncomePatchDto,
  IncomeQuery,
} from "../types/income.dto";

export const getIncomes = (query: IncomeQuery) =>
  unwrap(api.GET("/v1/incomes", { params: { query } }));

export const createIncome = (body: IncomeBodyDto) =>
  unwrap(api.POST("/v1/incomes", { body }));

export const updateIncome = (id: string, body: IncomePatchDto) =>
  unwrap(api.PATCH("/v1/incomes/{id}", { params: { path: { id } }, body }));

export const deleteIncome = (id: string) =>
  unwrap(api.DELETE("/v1/incomes/{id}", { params: { path: { id } } }));
