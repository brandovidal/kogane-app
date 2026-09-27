import { z } from "zod";
import { CURRENCIES } from "@/shared/constants/finance";
import { PERIOD_YEAR_MIN, PERIOD_YEAR_MAX } from "@/shared/constants/period";
import type { Income } from "../hooks/budget";
import type { MonthlyPeriod } from "@/shared/types/period";

export interface IncomeFormDraft extends MonthlyPeriod {
  description: string;
  amount: string;
  currency: (typeof CURRENCIES)[number];
  receivedAt: string;
  notes: string;
}

export const incomeFormSchema = z.object({
  description: z.string().trim().min(1, "Ingresa una descripción."),
  amount: z
    .number({ error: "Ingresa un monto válido." })
    .positive("El monto debe ser mayor que cero."),
  currency: z.enum(CURRENCIES),
  receivedAt: z.iso.date({ error: "Selecciona una fecha válida." }),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(PERIOD_YEAR_MIN).max(PERIOD_YEAR_MAX),
  notes: z
    .string()
    .trim()
    .max(500, "La nota admite hasta 500 caracteres.")
    .nullable(),
});

export function incomeFormDefaults(
  income: Income | null,
  period: MonthlyPeriod,
): IncomeFormDraft {
  const day = Math.min(
    new Date().getDate(),
    new Date(period.year, period.month, 0).getDate(),
  );
  return {
    description: income?.description ?? "",
    amount: income ? String(income.amount) : "",
    currency: income?.currency === "USD" ? "USD" : "PEN",
    receivedAt:
      income?.receivedAt.slice(0, 10) ??
      `${period.year}-${String(period.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    notes: income?.notes ?? "",
    month: income?.month ?? period.month,
    year: income?.year ?? period.year,
  };
}

export function parseIncomeForm(draft: IncomeFormDraft) {
  return incomeFormSchema.safeParse({
    ...draft,
    amount: draft.amount.trim() ? Number(draft.amount) : NaN,
    notes: draft.notes.trim() || null,
  });
}

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
