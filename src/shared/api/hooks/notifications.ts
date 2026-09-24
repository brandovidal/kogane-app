import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "../client";
import type { paths } from "../schema";
import { useApiMutation } from "./use-api-mutation";

export const notificationKeys = {
  all: ["notifications"] as const,
  recent: ["notifications", "recent"] as const,
  unread: ["notifications", "unread"] as const,
  history: (filter: HistoryFilter) => ["notifications", "history", filter] as const,
  settings: ["notifications", "settings"] as const,
};

type HistoryFilter = NonNullable<paths["/v1/notifications"]["get"]["parameters"]["query"]>;

// The bell checks every minute (D86): Workers has no WebSocket and one person is enough for polling
const BELL_REFRESH_MS = 60_000;

export const useRecentNotifications = (limit = 20) =>
  useQuery({
    queryKey: notificationKeys.recent,
    queryFn: () => unwrap(api.GET("/v1/notifications/recent", { params: { query: { limit } } })),
    refetchInterval: BELL_REFRESH_MS,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: notificationKeys.unread,
    queryFn: () => unwrap(api.GET("/v1/notifications/unread-count")),
    select: (data) => data.unread,
    refetchInterval: BELL_REFRESH_MS,
  });

export const useNotificationHistory = (filter: HistoryFilter) =>
  useQuery({
    queryKey: notificationKeys.history(filter),
    queryFn: () => unwrap(api.GET("/v1/notifications", { params: { query: filter } })),
  });

export const useMarkNotificationRead = () =>
  useApiMutation(
    (id: string) => unwrap(api.PATCH("/v1/notifications/{id}/read", { params: { path: { id } } })),
    { invalidate: [notificationKeys.all] },
  );

export const useMarkAllNotificationsRead = () =>
  useApiMutation(() => unwrap(api.POST("/v1/notifications/read-all")), {
    invalidate: [notificationKeys.all],
    success: "Notificaciones leídas",
  });

export const useNotificationSettings = () =>
  useQuery({ queryKey: notificationKeys.settings, queryFn: () => unwrap(api.GET("/v1/notifications/settings")) });

export const useUpdateNotificationSettings = () =>
  useApiMutation(
    (body: Schemas["UpdateNotificationSettingsDto"]) => unwrap(api.PUT("/v1/notifications/settings", { body })),
    { invalidate: [notificationKeys.settings], success: "Avisos guardados" },
  );
