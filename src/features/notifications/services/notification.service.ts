import { api, unwrap } from "@/shared/api/client";
import type {
  NotificationHistoryQuery,
  UpdateNotificationSettingsDto,
} from "../types/notification.dto";
export type {
  NotificationHistoryQuery,
  UpdateNotificationSettingsDto,
} from "../types/notification.dto";

export const getRecentNotifications = (limit: number) =>
  unwrap(api.GET("/v1/notifications/recent", { params: { query: { limit } } }));

export const getUnreadCount = () =>
  unwrap(api.GET("/v1/notifications/unread-count"));

export const getNotificationHistory = (query: NotificationHistoryQuery) =>
  unwrap(api.GET("/v1/notifications", { params: { query } }));

export const markNotificationRead = (id: string) =>
  unwrap(
    api.PATCH("/v1/notifications/{id}/read", { params: { path: { id } } }),
  );

export const markNotificationUnread = (id: string) =>
  unwrap(
    api.PATCH("/v1/notifications/{id}/unread", { params: { path: { id } } }),
  );

export const markAllNotificationsRead = () =>
  unwrap(api.POST("/v1/notifications/read-all"));

export const getNotificationSettings = () =>
  unwrap(api.GET("/v1/notifications/settings"));

export const updateNotificationSettings = (
  body: UpdateNotificationSettingsDto,
) => unwrap(api.PUT("/v1/notifications/settings", { body }));
