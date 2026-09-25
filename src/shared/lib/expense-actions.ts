import type { ExpenseResource } from "@/shared/api/types";

// Row actions of the expense tables (Editar · Duplicar · Estado · Pagado · Mes siguiente · Eliminar), like Notion

type Row = Record<string, unknown>;

// Columns each table accepts on create (kogane-api validates them per resource); the rest (ids, totals, the chat draft,
// the split of a shared expense) never travel in a copy
const FIELDS: Record<ExpenseResource, string[]> = {
  "daily-expenses": ["description", "amount", "currency", "exchangeRate", "personId", "notes", "expenseType", "categoryId", "spentAt", "paymentMethodId", "merchant"],
  "fixed-costs": ["description", "amount", "currency", "exchangeRate", "personId", "notes", "expenseType", "categoryId", "installment", "paymentMonth", "paymentYear", "paymentMethodId", "dueDate"],
  subscriptions: ["description", "amount", "currency", "exchangeRate", "personId", "notes", "expenseType", "categoryId", "paymentMonth", "paymentYear", "period", "paymentMethodId", "dueDate"],
  "credit-card-expenses": ["description", "amount", "currency", "exchangeRate", "personId", "notes", "expenseType", "categoryId", "installment", "paymentMonth", "paymentYear", "paymentMethodId", "processDate"],
  "recurring-expenses": ["description", "amount", "currency", "exchangeRate", "personId", "notes", "expenseType", "categoryId", "paymentMethodId", "targetType", "dayOfMonth", "isActive"],
};

const DATE_FIELDS = ["spentAt", "dueDate", "processDate"];

// The API sends dates as ISO date-times and takes YYYY-MM-DD
const toDay = (value: unknown) => (typeof value === "string" ? value.slice(0, 10) : value);

// A copy of the row as a new expense of the same table, not paid yet
export function duplicateBody(resource: ExpenseResource, row: Row): Row {
  const body: Row = {};
  for (const field of FIELDS[resource]) {
    const value = row[field];
    if (value === undefined || value === null) continue;
    body[field] = DATE_FIELDS.includes(field) ? toDay(value) : value;
  }
  if (typeof body.description === "string") body.description = `${body.description} (copia)`.slice(0, 120);
  // A copy is a new expense: it starts "No iniciado" (day to day and templates have no status)
  if (resource !== "daily-expenses" && resource !== "recurring-expenses") body.paymentStatus = "not_started";
  return body;
}

// The same row in the next payment month (a fixed cost or a card charge that moves: "pasa al mes siguiente")
export function nextMonthBody(row: { paymentMonth: number; paymentYear: number }) {
  const index = row.paymentYear * 12 + (row.paymentMonth - 1) + 1;
  return { paymentMonth: (index % 12) + 1, paymentYear: Math.floor(index / 12) };
}

export const isPaidStatus = (status: string) => ["paid", "waived", "cashback", "amortized", "skipped"].includes(status);
