import { api, unwrap, type Schemas } from "@/shared/api/client";
import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";

// "Generar" of Recurrentes: the rows of the month, never twice (D88)
export const useGenerateRecurring = () =>
  useApiMutation(
    (body: Schemas["GenerateRecurringDto"]) => unwrap(api.POST("/v1/recurring-expenses/generate", { body })),
    { invalidate: [["expenses"], ["calendar"]] },
  );
