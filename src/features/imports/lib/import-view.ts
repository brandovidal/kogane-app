import type {
  ImportBatch,
  StatementSummary,
  ImportRow,
} from "@/shared/api/types";
import type { HistoryItem } from "../types/import-types";
import { formatCurrency } from "@/shared/lib/currency";

// One list, newest first: the Notion imports and the statements read
export function historyOf(
  batches: ImportBatch[],
  statements: StatementSummary[],
  monthName: (month: number) => string,
): HistoryItem[] {
  const notion = batches.map((batch): HistoryItem => ({
    key: `notion:${batch.id}`,
    source: "notion",
    id: batch.id,
    title: "Notion",
    detail: `${batch.created} nuevas · ${batch.updated} cambiaron · ${batch.unchanged} iguales`,
    status: batch.status,
    pending: batch.status === "preview",
    createdAt: batch.createdAt,
  }));
  const read = statements.map((statement): HistoryItem => ({
    key: `statement:${statement.id}`,
    source: "statement",
    id: statement.id,
    title: `${statement.cardName} · ${monthName(statement.paymentMonth)} ${statement.paymentYear}`,
    detail: `${statement.counts.matched + statement.counts.created} coinciden · ${statement.counts.new} nuevos`,
    status: statement.status,
    pending: statement.status === "review",
    createdAt: statement.createdAt,
  }));
  return [...notion, ...read].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export const pageCount = (total: number, pageSize: number) =>
  Math.max(1, Math.ceil(total / pageSize));

// A month of the check: the rows linked to its Resumen page add up to its "Gastos" (to the cent)
export const monthMatches = (month: {
  linked: number;
  notionSpent: number | null;
}) =>
  month.notionSpent != null &&
  Math.abs(month.linked - month.notionSpent) < 0.01;

export const amountOf = (row: ImportRow) =>
  row.amount == null
    ? "—"
    : row.kind === "group"
      ? `${row.amount} %`
      : formatCurrency(row.amount, row.currency ?? "PEN");

export const importRowFileName = (file: string) =>
  file.replace(/ [0-9a-f]{32}(_all)?\.csv$/i, "");
