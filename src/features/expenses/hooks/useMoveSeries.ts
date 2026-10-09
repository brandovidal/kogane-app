import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import { expenseKeys } from "./expense-keys";
import { moveSeries } from "../services/expense.service";
import type { MoveSeriesDto } from "../services/dto/expense.dto";

export type MoveSeries = MoveSeriesDto;

export const useMoveSeries = () =>
  useApiMutation((body: MoveSeries) => moveSeries(body), {
    invalidate: [
      expenseKeys.resource("fixed-costs"),
      expenseKeys.resource("subscriptions"),
      expenseKeys.resource("recurring-expenses"),
      ["summary"],
    ],
  });
