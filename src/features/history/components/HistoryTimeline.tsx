import { CalendarDays } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/ui/marker";
import { groupHistoryByDay } from "../lib/history-timeline";
import type { HistoryTimelineProps } from "../types/history-timeline";
import { HistoryTimelineItem } from "./HistoryTimelineItem";

export function HistoryTimeline({ entries, labels, showRecord, compact = false }: HistoryTimelineProps) {
  const groups = groupHistoryByDay(entries);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.day} aria-label={group.label} className={compact ? "space-y-3" : "space-y-4"}>
          {compact ? (
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <time dateTime={group.day === "unknown" ? undefined : group.day}>
                {group.day === today ? `Hoy · ${compactDate(group.day)}` : group.label}
              </time>
            </h3>
          ) : (
            <Marker variant="separator" className="gap-1.5 text-xs">
              <MarkerIcon><CalendarDays /></MarkerIcon>
              <MarkerContent><time dateTime={group.day === "unknown" ? undefined : group.day}>{group.label}</time></MarkerContent>
            </Marker>
          )}
          <ol className={compact ? "relative before:absolute before:top-3 before:bottom-3 before:left-3 before:w-px before:bg-border" : "relative before:absolute before:top-6 before:bottom-6 before:left-3.5 before:w-px before:bg-border"}>
            {group.entries.map((entry) => <HistoryTimelineItem key={entry.id} entry={entry} labels={labels} showRecord={showRecord} compact={compact} />)}
          </ol>
        </section>
      ))}
    </div>
  );
}

function compactDate(day: string) {
  return new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", day: "numeric", month: "long" })
    .format(new Date(`${day}T12:00:00`))
    .toLocaleUpperCase("es-PE");
}
