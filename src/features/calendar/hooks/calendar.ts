import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  getCalendar,
  getCommittedInstallments,
  getReminders,
  payCalendarEvent,
  type PayEventDto,
} from "../services/calendar.service";

export const calendarKeys = {
  all: ["calendar"] as const,
  events: (from: string, to: string) =>
    ["calendar", "events", from, to] as const,
  installments: (months: number) =>
    ["calendar", "installments", months] as const,
  reminders: (days: number) => ["calendar", "reminders", days] as const,
};

// Payment calendar of a range of days (P20, D89)
export const useCalendar = (from: string, to: string) =>
  useQuery({
    queryKey: calendarKeys.events(from, to),
    queryFn: () => getCalendar(from, to),
  });

// What is due in the next days (the Redis list of kogane-api)
export const useReminders = (days = 14) =>
  useQuery({
    queryKey: calendarKeys.reminders(days),
    queryFn: () => getReminders(days),
  });

export const useCommittedInstallments = (months = 3) =>
  useQuery({
    queryKey: calendarKeys.installments(months),
    queryFn: () => getCommittedInstallments(months),
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
    async (body: PayEventDto) => {
      const { outcome } = await payCalendarEvent(body);
      return PAY_OUTCOME_TEXTS[outcome] ?? outcome;
    },
    { invalidate: [calendarKeys.all, ["expenses"], ["debts"], ["summary"]] },
  );
