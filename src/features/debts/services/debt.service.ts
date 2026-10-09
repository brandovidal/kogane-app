import { api, unwrap } from "@/shared/api/client";
import type {
  CardCheckQuery,
  CreateDebtDto,
  DebtBulkDto,
  DebtPaymentDto,
  DebtQuery,
  UpdateDebtDto,
} from "../types/debt.dto";
export type {
  CardCheckQuery,
  CreateDebtDto,
  DebtBulkDto,
  DebtPaymentDto,
  DebtQuery,
  UpdateDebtDto,
} from "../types/debt.dto";

export const getDebts = (query: DebtQuery) =>
  unwrap(api.GET("/v1/debts", { params: { query } }));
export const getDebt = (id: string) =>
  unwrap(api.GET("/v1/debts/{id}", { params: { path: { id } } }));
export const getCardCheck = (query: CardCheckQuery) =>
  unwrap(api.GET("/v1/debts/card-check", { params: { query } }));
export const createDebt = (body: CreateDebtDto) =>
  unwrap(api.POST("/v1/debts", { body }));
export const updateDebt = (id: string, body: UpdateDebtDto) =>
  unwrap(api.PATCH("/v1/debts/{id}", { params: { path: { id } }, body }));
export const deleteDebt = (id: string) =>
  unwrap(api.DELETE("/v1/debts/{id}", { params: { path: { id } } }));
export const addDebtPayment = (id: string, body: DebtPaymentDto) =>
  unwrap(
    api.POST("/v1/debts/{id}/payments", { params: { path: { id } }, body }),
  );
export const bulkDebts = (body: DebtBulkDto) =>
  unwrap(api.POST("/v1/debts/bulk", { body }));
