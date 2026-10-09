import type { Schemas } from "@/shared/api/client";
import type { paths } from "@/shared/api/schema";

export type NotificationHistoryQuery = NonNullable<
  paths["/v1/notifications"]["get"]["parameters"]["query"]
>;
export type UpdateNotificationSettingsDto =
  Schemas["UpdateNotificationSettingsDto"];
