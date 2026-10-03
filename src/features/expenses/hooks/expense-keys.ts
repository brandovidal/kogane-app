import type { ExpenseResource } from "@/shared/api/types";

export type SubscriptionGroup = "platform" | "recurring";

export const expenseKeys = {
  resource: (resource: ExpenseResource) => ["expenses", resource] as const,
  record: (resource: ExpenseResource, id?: string) =>
    ["expenses", resource, "record", id] as const,
  list: (
    resource: ExpenseResource,
    month?: number,
    year?: number,
    kind?: SubscriptionGroup,
  ) => ["expenses", resource, month, year, kind] as const,
};
