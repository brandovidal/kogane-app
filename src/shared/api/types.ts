import type { Schemas } from "./client";
import type { operations } from "./schema";

// Entities of kogane-api as the web uses them (D62): taken from the generated schema, never written by hand
type DataOf<K extends keyof Schemas> = Schemas[K] extends { data: infer D } ? D : never;

export type Person = DataOf<"PersonResponseDto">;
export type PaymentMethod = DataOf<"PaymentMethodResponseDto">;
export type Category = DataOf<"CategoryResponseDto">;
export type BudgetGroup = DataOf<"BudgetGroupResponseDto">;

export type ExpenseRecord = DataOf<"ExpenseRecordResponseDto">;
export type DailyExpense = Extract<ExpenseRecord, { spentAt: string }>;
export type FixedCost = Extract<ExpenseRecord, { attentionDate: string | null }>;
export type Subscription = Extract<ExpenseRecord, { period: string; paymentMonth: number }>;
export type CreditCardExpense = Extract<ExpenseRecord, { processDate: string | null }>;
export type RecurringExpense = Extract<ExpenseRecord, { dayOfMonth: number }>;
export type MoveSeriesResult = DataOf<"MoveSeriesResponseDto">;
export type BudgetSettings = DataOf<"BudgetSettingsResponseDto">;
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

// Reminders and notifications (P20)
export type AppNotification = DataOf<"RecentNotificationsResponseDto">[number];
export type NotificationSettings = DataOf<"NotificationSettingsResponseDto">;
export type NotificationKind = AppNotification["kind"];
export type CalendarEvent = DataOf<"CalendarEventsResponseDto">[number];
export type CommittedInstallments = DataOf<"CommittedInstallmentsResponseDto">;

// Bank statements (P14, D95)
export type Statement = DataOf<"StatementResponseDto">;
export type StatementRow = Statement["rows"][number];
export type StatementSummary = DataOf<"StatementListResponseDto">[number];
export type ImportBatch = DataOf<"ImportListResponseDto">[number];
export type ImportDetail = DataOf<"ImportDetailResponseDto">;
export type ImportRows = DataOf<"ImportRowsResponseDto">;
export type ImportRow = ImportRows["items"][number];
export type ImportTab = NonNullable<NonNullable<operations["ImportsController_rows_v1"]["parameters"]["query"]>["tab"]>;
export type ImportRowStatus = ImportRow["status"];
