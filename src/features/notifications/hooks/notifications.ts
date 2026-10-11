import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  collectNow,
  getNotificationHistory,
  getNotificationSettings,
  getRecentNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  remindDebts,
  updateNotificationSettings,
  type CollectNowDto,
  type NotificationHistoryQuery,
  type RemindDebtsDto,
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

const refreshBell = [notificationKeys.all];

// "Cobrar a todos por Mensajes": the notices already sent today are not repeated, so the toast says how many are new
export const useCollectNow = () =>
  useApiMutation((body: CollectNowDto) => collectNow(body), {
    invalidate: refreshBell,
    success: (result) =>
      result.notifications
        ? `${result.notifications} ${result.notifications === 1 ? "cobro enviado" : "cobros enviados"} a Mensajes`
        : "No hay cobros nuevos: ya se enviaron hoy o nadie tiene saldo",
  });

// "Recordar pago": the paid ones are left out by the API
export const useRemindDebts = () =>
  useApiMutation((body: RemindDebtsDto) => remindDebts(body), {
    invalidate: refreshBell,
    success: (result) =>
      result.notifications
        ? `${result.notifications} ${result.notifications === 1 ? "recordatorio enviado" : "recordatorios enviados"} a Mensajes`
        : "Sin recordatorios nuevos: ya se enviaron hoy o están pagadas",
  });
