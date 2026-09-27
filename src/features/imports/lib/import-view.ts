import type { ImportBatch, ImportRowStatus, ImportTab, StatementSummary } from "@/shared/api/types";

// Reconocimiento / Importación (P14, D104): labels of the preview and the history that joins both sources

export type ImportSource = "notion" | "statement";

export const SOURCE_LABELS: Record<ImportSource, string> = {
  notion: "Notion (ZIP o CSV)",
  statement: "Estado de cuenta (PDF)",
};

export const TAB_LABELS: Record<ImportTab, string> = {
  cards: "Tarjetas",
  fixed_costs: "Costos fijos",
  platforms: "Plataformas",
  debts: "Deudas",
  budget: "Presupuesto",
  issues: "Avisos",
};

export const TAB_ORDER: ImportTab[] = ["cards", "fixed_costs", "platforms", "debts", "budget", "issues"];

export const ROW_STATUS: Record<ImportRowStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Nueva", variant: "default" },
  changed: { label: "Cambió", variant: "outline" },
  unchanged: { label: "Igual", variant: "secondary" },
  blocked: { label: "Bloqueada", variant: "destructive" },
  warning: { label: "Aviso", variant: "outline" },
};

export const BATCH_STATUS: Record<string, string> = {
  preview: "Previsualización",
  applied: "Importado",
  discarded: "Descartado",
  review: "Revisar",
  done: "Listo",
};

export interface HistoryItem {
  key: string; // "notion:<id>" | "statement:<id>"
  source: ImportSource;
  id: string;
  title: string;
  detail: string;
  status: string;
  pending: boolean; // still waiting for a decision
  createdAt: string;
}

// One list, newest first: the Notion imports and the statements read
export function historyOf(batches: ImportBatch[], statements: StatementSummary[], monthName: (month: number) => string): HistoryItem[] {
  const notion = batches.map(
    (batch): HistoryItem => ({
      key: `notion:${batch.id}`,
      source: "notion",
      id: batch.id,
      title: "Notion",
      detail: `${batch.created} nuevas · ${batch.updated} cambiaron · ${batch.unchanged} iguales`,
      status: batch.status,
      pending: batch.status === "preview",
      createdAt: batch.createdAt,
    }),
  );
  const read = statements.map(
    (statement): HistoryItem => ({
      key: `statement:${statement.id}`,
      source: "statement",
      id: statement.id,
      title: `${statement.cardName} · ${monthName(statement.paymentMonth)} ${statement.paymentYear}`,
      detail: `${statement.counts.matched + statement.counts.created} coinciden · ${statement.counts.new} nuevos`,
      status: statement.status,
      pending: statement.status === "review",
      createdAt: statement.createdAt,
    }),
  );
  return [...notion, ...read].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const pageCount = (total: number, pageSize: number) => Math.max(1, Math.ceil(total / pageSize));

// A month of the check: the rows linked to its Resumen page add up to its "Gastos" (to the cent)
export const monthMatches = (month: { linked: number; notionSpent: number | null }) =>
  month.notionSpent != null && Math.abs(month.linked - month.notionSpent) < 0.01;
