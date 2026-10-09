import { api, unwrap } from "@/shared/api/client";
import type { GenerateRecurringDto } from "../types/recurring.dto";
export type { GenerateRecurringDto } from "../types/recurring.dto";

export const generateRecurring = (body: GenerateRecurringDto) =>
  unwrap(api.POST("/v1/recurring-expenses/generate", { body }));
