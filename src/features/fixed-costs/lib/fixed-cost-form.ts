import { z } from "zod";
import type { FixedCost } from "@/shared/api/types";
import { CURRENCIES } from "@/shared/constants/finance";
import { toIsoDate } from "@/shared/lib/dates";
import { installmentError } from "@/features/expenses/lib/installments";

const optionalText = z.string().trim().transform((value) => value || null);

export const fixedCostFormSchema = z.object({
  description: z.string().trim().min(1, "Descripción requerida"),
  amount: z.number({ error: "Monto requerido" }).positive("Monto debe ser positivo"),
  currency: z.enum(CURRENCIES),
  exchangeRate: z.number().positive().nullable(),
  expenseType: z.string(),
  paymentStatus: z.string(),
  personId: z.string().min(1, "Persona requerida"),
  paymentMethodId: z.string().nullable(),
  categoryId: z.string().min(1, "Categoría requerida"),
  paymentMonth: z.number().int().min(1).max(12),
  paymentYear: z.number().int().min(2020).max(2100),
  dueDate: z.string(),
  hasInstallments: z.boolean(),
  installment: optionalText,
  notes: optionalText,
}).superRefine((form, context) => {
  if (!form.hasInstallments) return;
  const error = installmentError(form.installment, true);
  if (error) context.addIssue({ code: "custom", path: ["installment"], message: error });
});

export type FixedCostForm = z.input<typeof fixedCostFormSchema>;
export type FixedCostValues = z.output<typeof fixedCostFormSchema>;

export const FIXED_COST_SCHEDULE_FIELDS = ["paymentMonth", "paymentYear", "dueDate", "installment", "hasInstallments"];

export function fixedCostFormDefaults(cost: FixedCost | undefined, period: { month: number; year: number }): FixedCostForm {
  return {
    description: cost?.description ?? "",
    amount: cost?.amount ?? 0,
    currency: (cost?.currency ?? "PEN") as FixedCostForm["currency"],
    exchangeRate: cost?.exchangeRate ?? null,
    expenseType: cost?.expenseType ?? "essential",
    paymentStatus: cost?.paymentStatus ?? "not_started",
    personId: cost?.personId ?? "",
    paymentMethodId: cost?.paymentMethodId ?? null,
    categoryId: cost?.categoryId ?? "",
    paymentMonth: cost?.paymentMonth ?? period.month,
    paymentYear: cost?.paymentYear ?? period.year,
    dueDate: toIsoDate(cost?.dueDate ?? null),
    hasInstallments: !!cost?.installment,
    installment: cost?.installment ?? "",
    notes: cost?.notes ?? "",
  };
}

export function fixedCostSaveBody({ hasInstallments, ...data }: FixedCostValues) {
  return {
    ...data,
    installment: hasInstallments ? data.installment : null,
    exchangeRate: data.currency === "PEN" ? null : data.exchangeRate,
    dueDate: data.dueDate || null,
  };
}
