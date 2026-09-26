import type { CalendarEvent } from "@/shared/api/types";

type Kind = CalendarEvent["kind"];

// Payment calendar (P20, D89): the labels and dot colors of each kind, and the month grid (weeks from Monday)
export const EVENT_KIND_LABELS: Record<Kind, string> = {
  card_due: "Pago de tarjeta",
  card_close: "Cierre de tarjeta",
  fixed_cost: "Costo fijo",
  subscription: "Plataforma",
  debt_i_owe: "Le debo",
  debt_owed_to_me: "Me deben",
  recurring: "Recurrente por generar",
};

export const EVENT_KIND_DOTS: Record<Kind, string> = {
  card_due: "bg-primary",
  card_close: "bg-muted-foreground",
  fixed_cost: "bg-amber-500",
  subscription: "bg-violet-500",
  debt_i_owe: "bg-rose-500",
  debt_owed_to_me: "bg-emerald-500",
  recurring: "bg-sky-500",
};

// What can be marked paid from the web (the same refs as ✅ Pagado of the bot)
const PAYABLE = ["card_statement", "fixed_cost", "subscription", "debt"];
export const isPayable = (event: CalendarEvent) =>
  event.status !== "paid" && event.kind !== "card_close" && PAYABLE.includes(event.refType ?? "");

// "Pago IO", "Cierre IO", "Préstamo 2/5 · Danery"
export function eventLabel(event: CalendarEvent): string {
  if (event.kind === "card_due") return `Pago ${event.name}`;
  if (event.kind === "card_close") return `Cierre ${event.name}`;
  const installment = event.installment ? ` ${event.installment}` : "";
  const person = event.personName ? ` · ${event.personName}` : "";
  return `${event.name}${installment}${person}`;
}

export interface GridDay {
  date: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
}

// Whole weeks (Monday to Sunday) that cover the month, with the days of the neighbor months greyed out
export function monthGrid(month: number, year: number): GridDay[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday = 0
  const start = new Date(first.getTime() - offset * 86_400_000);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const weeks = Math.ceil((offset + last) / 7);

  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(start.getTime() + (week * 7 + weekday) * 86_400_000);
      return {
        date: date.toISOString().slice(0, 10),
        day: date.getUTCDate(),
        inMonth: date.getUTCMonth() === month - 1,
      };
    }),
  );
}

export function eventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const byDay = new Map<string, CalendarEvent[]>();
  for (const event of events) byDay.set(event.date, [...(byDay.get(event.date) ?? []), event]);
  return byDay;
}

// First and last day of the grid of that month (what the calendar asks the API)
export function gridRange(month: number, year: number): { from: string; to: string } {
  const weeks = monthGrid(month, year);
  return { from: weeks[0][0].date, to: weeks[weeks.length - 1][6].date };
}
