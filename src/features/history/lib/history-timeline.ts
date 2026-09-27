import type { HistoryEntry } from "@/shared/api/types";
import type { HistoryDayGroup } from "../types/history-timeline";

const TIME_ZONE = "America/Lima";
const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const dateFormatter = new Intl.DateTimeFormat("es-PE", { timeZone: TIME_ZONE, day: "numeric", month: "long", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("es-PE", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" });

export function formatHistoryTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Hora desconocida" : timeFormatter.format(date);
}

export function groupHistoryByDay(entries: HistoryEntry[]): HistoryDayGroup[] {
  const groups = new Map<string, HistoryDayGroup>();
  const sorted = [...entries].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  for (const entry of sorted) {
    const date = new Date(entry.createdAt);
    const valid = !Number.isNaN(date.getTime());
    const parts = valid ? dayFormatter.formatToParts(date) : [];
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value;
    const day = valid ? `${part("year")}-${part("month")}-${part("day")}` : "unknown";
    const group = groups.get(day) ?? { day, label: valid ? dateFormatter.format(date) : "Fecha desconocida", entries: [] };
    group.entries.push(entry);
    groups.set(day, group);
  }

  return [...groups.values()];
}
