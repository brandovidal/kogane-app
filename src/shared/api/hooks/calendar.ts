import { useQuery } from "@tanstack/react-query";

import { api, unwrap, type Schemas } from "../client";
import { useApiMutation } from "./use-api-mutation";

export const calendarKeys = {
  all: ["calendar"] as const,
  events: (from: string, to: string) => ["calendar", "events", from, to] as const,
  installments: (months: number) => ["calendar", "installments", months] as const,
  reminders: (days: number) => ["calendar", "reminders", days] as const,
};

// Payment calendar of a range of days (P20, D89)
export const useCalendar = (from: string, to: string) =>
  useQuery({
    queryKey: calendarKeys.events(from, to),
    queryFn: () => unwrap(api.GET("/v1/calendar", { params: { query: { from, to } } })),
  });

// What is due in the next days (the Redis list of kogane-api)
export const useReminders = (days = 14) =>
  useQuery({
    queryKey: calendarKeys.reminders(days),
    queryFn: () => unwrap(api.GET("/v1/reminders", { params: { query: { days } } })),
  });

export const useCommittedInstallments = (months = 3) =>
  useQuery({
    queryKey: calendarKeys.installments(months),
    queryFn: () => unwrap(api.GET("/v1/calendar/installments", { params: { query: { months } } })),
  });

const PAY_OUTCOME_TEXTS: Record<string, string> = {
  paid: "Pagado",
  already_paid: "Ya estaba pagado",
  nothing_to_pay: "No hay nada pendiente de ese pago",
  not_found: "Ya no existe",
};

// ✅ Pagado of the calendar: the same as the button of the bot. Returns the text to show
export const usePayCalendarEvent = () =>
  useApiMutation(
    async (body: Schemas["PayEventDto"]) => {
      const { outcome } = await unwrap(api.POST("/v1/calendar/pay", { body }));
      return PAY_OUTCOME_TEXTS[outcome] ?? outcome;
    },
    { invalidate: [calendarKeys.all, ["expenses"], ["debts"], ["summary"]] },
  );

// "Generar" of Recurrentes: the rows of the month, never twice (D88)
export const useGenerateRecurring = () =>
  useApiMutation(
    (body: Schemas["GenerateRecurringDto"]) => unwrap(api.POST("/v1/recurring-expenses/generate", { body })),
    { invalidate: [["expenses"], calendarKeys.all] },
  );
