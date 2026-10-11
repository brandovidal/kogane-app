import type { Schemas } from "@/shared/api/client";

export type SavePersonSummaryDto = Schemas["SavePersonSummaryDto"];
export type BulkPersonSummaryStatusDto = Schemas["BulkPersonSummaryStatusDto"];
export type PersonSummaryStatus = SavePersonSummaryDto["status"] & string;
export type PersonSummaryAdjustment = NonNullable<
  SavePersonSummaryDto["adjustments"]
>[number];
