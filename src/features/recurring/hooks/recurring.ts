import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  generateRecurring,
  recurringFromSeries,
  type GenerateRecurringDto,
  type RecurringFromSeriesDto,
} from "../services/recurring.service";

// "Generar" of Recurrentes: the rows of the month, never twice (D88)
export const useGenerateRecurring = () =>
  useApiMutation((body: GenerateRecurringDto) => generateRecurring(body), {
    invalidate: [["expenses"], ["calendar"]],
  });

// "Pasar desde Costos fijos / Plataformas": a monthly template copied from the latest row of a series
export const useRecurringFromSeries = () =>
  useApiMutation((body: RecurringFromSeriesDto) => recurringFromSeries(body), {
    invalidate: [["expenses"], ["calendar"], ["recurring-expenses"]],
    success: "Listo: se repetirá cada mes en Recurrentes",
  });
