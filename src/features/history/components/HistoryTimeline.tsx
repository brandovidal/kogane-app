import { CalendarDays } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/ui/marker";
import { groupHistoryByDay } from "../lib/history-timeline";
import type { HistoryTimelineProps } from "../types/history-timeline";
import { HistoryTimelineItem } from "./HistoryTimelineItem";

export function HistoryTimeline({ entries, labels, showRecord }: HistoryTimelineProps) {
  const groups = groupHistoryByDay(entries);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.day} aria-label={group.label} className="space-y-4">
          <Marker variant="separator" className="gap-1.5 text-xs">
            <MarkerIcon><CalendarDays /></MarkerIcon>
            <MarkerContent><time dateTime={group.day === "unknown" ? undefined : group.day}>{group.label}</time></MarkerContent>
          </Marker>
          <ol className="relative before:absolute before:top-6 before:bottom-6 before:left-3.5 before:w-px before:bg-border">
            {group.entries.map((entry) => <HistoryTimelineItem key={entry.id} entry={entry} labels={labels} showRecord={showRecord} />)}
          </ol>
        </section>
      ))}
    </div>
  );
}
