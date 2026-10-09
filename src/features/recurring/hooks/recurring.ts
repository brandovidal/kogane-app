import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  generateRecurring,
  type GenerateRecurringDto,
} from "../services/recurring.service";

// "Generar" of Recurrentes: the rows of the month, never twice (D88)
export const useGenerateRecurring = () =>
  useApiMutation((body: GenerateRecurringDto) => generateRecurring(body), {
    invalidate: [["expenses"], ["calendar"]],
  });
