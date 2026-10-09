import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  getNotificationHistory,
  getNotificationSettings,
  getRecentNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  updateNotificationSettings,
  type NotificationHistoryQuery,
  type UpdateNotificationSettingsDto,
} from "../services/notification.service";

export const notificationKeys = {
  all: ["notifications"] as const,
  recent: ["notifications", "recent"] as const,
  unread: ["notifications", "unread"] as const,
  history: (filter: HistoryFilter) =>
    ["notifications", "history", filter] as const,
  settings: ["notifications", "settings"] as const,
};

type HistoryFilter = NotificationHistoryQuery;

// The bell checks every minute (D86): Workers has no WebSocket and one person is enough for polling
const BELL_REFRESH_MS = 60_000;

export const useRecentNotifications = (limit = 20) =>
  useQuery({
    queryKey: notificationKeys.recent,
    queryFn: () => getRecentNotifications(limit),
    refetchInterval: BELL_REFRESH_MS,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: notificationKeys.unread,
    queryFn: getUnreadCount,
    select: (data) => data.unread,
    refetchInterval: BELL_REFRESH_MS,
  });

export const useNotificationHistory = (filter: HistoryFilter) =>
  useQuery({
    queryKey: notificationKeys.history(filter),
    queryFn: () => getNotificationHistory(filter),
  });

export const useMarkNotificationRead = () =>
  useApiMutation((id: string) => markNotificationRead(id), {
    invalidate: [notificationKeys.all],
  });

// Back to unread: the bell counts it again
export const useMarkNotificationUnread = () =>
  useApiMutation((id: string) => markNotificationUnread(id), {
    invalidate: [notificationKeys.all],
  });

export const useMarkAllNotificationsRead = () =>
  useApiMutation(() => markAllNotificationsRead(), {
    invalidate: [notificationKeys.all],
    success: "Notificaciones leídas",
  });

export const useNotificationSettings = () =>
  useQuery({
    queryKey: notificationKeys.settings,
    queryFn: getNotificationSettings,
  });

export const useUpdateNotificationSettings = () =>
  useApiMutation(
    (body: UpdateNotificationSettingsDto) => updateNotificationSettings(body),
    { invalidate: [notificationKeys.settings], success: "Avisos guardados" },
  );
