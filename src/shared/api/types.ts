import type { Schemas } from "./client";

// Entities of kogane-api as the web uses them (D62): taken from the generated schema, never written by hand
type DataOf<K extends keyof Schemas> = Schemas[K] extends { data: infer D } ? D : never;

export type Person = DataOf<"PersonResponseDto">;
export type PaymentMethod = DataOf<"PaymentMethodResponseDto">;
export type Category = DataOf<"CategoryResponseDto">;
export type BudgetGroup = DataOf<"BudgetGroupResponseDto">;

export type ExpenseRecord = DataOf<"ExpenseRecordResponseDto">;
export type DailyExpense = Extract<ExpenseRecord, { spentAt: string }>;
export type FixedCost = Extract<ExpenseRecord, { attentionDate: string | null }>;
export type Subscription = Extract<ExpenseRecord, { period: string }>;
export type CreditCardExpense = Extract<ExpenseRecord, { processDate: string | null }>;
export type RecurringExpense = Extract<ExpenseRecord, { dayOfMonth: number }>;
export type ExpenseBody = Schemas["ExpenseBodyDto"];

export type Summary = DataOf<"SummaryResponseDto">;
export type Debt = DataOf<"DebtListResponseDto">[number];
export type DebtSummary = DataOf<"DebtSummaryResponseDto">[number];
export type CreateDebt = Schemas["CreateDebtDto"];

// The path of each table in /v1/expenses/{resource}
export const EXPENSE_RESOURCES = {
  daily: "daily-expenses",
  fixedCost: "fixed-costs",
  subscription: "subscriptions",
  creditCard: "credit-card-expenses",
  recurring: "recurring-expenses",
} as const;
export type ExpenseResource = (typeof EXPENSE_RESOURCES)[keyof typeof EXPENSE_RESOURCES];

export interface ExpenseByResource {
  "daily-expenses": DailyExpense;
  "fixed-costs": FixedCost;
  subscriptions: Subscription;
  "credit-card-expenses": CreditCardExpense;
  "recurring-expenses": RecurringExpense;
}
