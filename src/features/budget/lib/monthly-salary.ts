import { z } from "zod";
import { PERIOD_YEAR_MIN, PERIOD_YEAR_MAX } from "@/shared/constants/period";

export type { MonthlyPeriod as SalaryPeriod } from "@/shared/types/period";
export { periodFromParams as salaryPeriodFromUrl } from "@/shared/lib/period";

export const monthlySalarySchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(PERIOD_YEAR_MIN).max(PERIOD_YEAR_MAX),
  salary: z
    .number({ error: "Ingresa un sueldo válido." })
    .min(0, "El sueldo no puede ser negativo."),
  limitPercent: z
    .number({ error: "Ingresa un porcentaje válido." })
    .min(0, "El mínimo es 0 %.")
    .max(100, "El máximo es 100 %."),
});
