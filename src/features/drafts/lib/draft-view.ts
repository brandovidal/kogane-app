export interface DraftLike {
  amount: number | null;
  missingFields: string[];
}

export type DraftState = "ready" | "incomplete";

export const DRAFT_FIELD_LABELS: Record<string, string> = {
  destination: "Destino",
  description: "Descripción",
  amount: "Monto",
  personId: "Persona",
  paymentMethodId: "Medio de pago",
  categoryId: "Categoría",
  period: "Período",
};

export const missingLabels = (draft: Pick<DraftLike, "missingFields">) =>
  draft.missingFields.map((field) => DRAFT_FIELD_LABELS[field] ?? field);

export const draftState = (
  draft: Pick<DraftLike, "missingFields">,
): DraftState => (draft.missingFields.length ? "incomplete" : "ready");

export interface DraftSummary {
  total: number;
  ready: number;
  incomplete: number;
  readyPercent: number;
  /** Suma de los borradores con monto, en su moneda original (el resumen solo se muestra si hay una). */
  totalAmount: number;
  withoutAmount: number;
}

export function summarizeDrafts(items: DraftLike[]): DraftSummary {
  const ready = items.filter((item) => draftState(item) === "ready").length;
  const withAmount = items.filter((item) => item.amount != null);
  return {
    total: items.length,
    ready,
    incomplete: items.length - ready,
    readyPercent: items.length ? Math.round((ready / items.length) * 100) : 0,
    totalAmount: withAmount.reduce((sum, item) => sum + (item.amount ?? 0), 0),
    withoutAmount: items.length - withAmount.length,
  };
}

// "Guardar listos": solo los completos; los incompletos se quedan en Por revisar
export const readyDrafts = <T extends DraftLike>(items: T[]) =>
  items.filter((item) => draftState(item) === "ready");
