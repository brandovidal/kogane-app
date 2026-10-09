import type { paths } from "@/shared/api/schema";

export type HistoryFilter = NonNullable<
  paths["/v1/history"]["get"]["parameters"]["query"]
>;
