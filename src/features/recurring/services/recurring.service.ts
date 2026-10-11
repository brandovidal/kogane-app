import { api, unwrap } from "@/shared/api/client";
import type {
  GenerateRecurringDto,
  RecurringFromSeriesDto,
} from "../types/recurring.dto";
export type {
  GenerateRecurringDto,
  RecurringFromSeriesDto,
} from "../types/recurring.dto";

export const generateRecurring = (body: GenerateRecurringDto) =>
  unwrap(api.POST("/v1/recurring-expenses/generate", { body }));

export const recurringFromSeries = (body: RecurringFromSeriesDto) =>
  unwrap(api.POST("/v1/recurring-expenses/from-series", { body }));
