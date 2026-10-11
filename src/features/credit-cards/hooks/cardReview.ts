import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  reviewCardCharges,
  type CardReviewDto,
} from "../services/card-review.service";

export const useReviewCardCharges = () =>
  useApiMutation((body: CardReviewDto) => reviewCardCharges(body), {
    invalidate: [["expenses"], ["statements"]],
    success: (result) =>
      result.reviewedAt
        ? `${result.affected} ${result.affected === 1 ? "gasto revisado" : "gastos revisados"}`
        : `${result.affected} ${result.affected === 1 ? "gasto sin revisar" : "gastos sin revisar"}`,
  });
