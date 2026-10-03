import type { ImportRowStatus, ImportTab } from "@/shared/api/types";
import type { ImportSource } from "../types/import-types";

export const SOURCE_LABELS: Record<ImportSource, string> = {
  statement: "Estado de cuenta (PDF)",
  notion: "Notion (ZIP o CSV)",
};

export const TAB_LABELS: Record<ImportTab, string> = {
  cards: "Tarjetas",
  fixed_costs: "Costos fijos",
  platforms: "Plataformas",
  debts: "Deudas",
  budget: "Presupuesto",
  issues: "Avisos",
};

export const TAB_ORDER: ImportTab[] = [
  "cards",
  "fixed_costs",
  "platforms",
  "debts",
  "budget",
  "issues",
];

export const ROW_STATUS: Record<
  ImportRowStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
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

export const IMPORT_STATUS_ALL = "all";
export const IMPORT_ROW_STATUSES: ImportRowStatus[] = [
  "new",
  "changed",
  "unchanged",
];
export const IMPORT_ISSUE_STATUSES: ImportRowStatus[] = ["blocked", "warning"];
