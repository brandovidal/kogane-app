import { api, unwrap, type Schemas } from "@/shared/api/client";
import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import { expenseKeys } from "./expense-keys";

export type MoveSeries = Schemas["MoveSeriesDto"];

export const useMoveSeries = () =>
  useApiMutation(
    (body: MoveSeries) => unwrap(api.POST("/v1/expense-moves", { body })),
    {
      invalidate: [
        expenseKeys.resource("fixed-costs"),
        expenseKeys.resource("subscriptions"),
        expenseKeys.resource("recurring-expenses"),
        ["summary"],
      ],
    },
  );
