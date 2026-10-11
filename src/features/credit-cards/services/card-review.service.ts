import { api, unwrap } from "@/shared/api/client";
import type { Schemas } from "@/shared/api/client";

export type CardReviewDto = Schemas["CardReviewDto"];

// "Marcar como revisados": card charges checked against the statement (reviewed: false unmarks them)
export const reviewCardCharges = (body: CardReviewDto) =>
  unwrap(api.POST("/v1/card-reviews", { body }));
