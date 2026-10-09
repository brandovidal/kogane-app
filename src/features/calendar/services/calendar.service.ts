import { api, unwrap } from "@/shared/api/client";
import type { PayEventDto } from "../types/calendar.dto";
export type { PayEventDto } from "../types/calendar.dto";

export const getCalendar = (from: string, to: string) =>
  unwrap(api.GET("/v1/calendar", { params: { query: { from, to } } }));

export const getReminders = (days: number) =>
  unwrap(api.GET("/v1/reminders", { params: { query: { days } } }));

export const getCommittedInstallments = (months: number) =>
  unwrap(
    api.GET("/v1/calendar/installments", { params: { query: { months } } }),
  );

export const payCalendarEvent = (body: PayEventDto) =>
  unwrap(api.POST("/v1/calendar/pay", { body }));
