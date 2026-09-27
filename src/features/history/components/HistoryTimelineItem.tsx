import { Badge } from "@/ui/badge";
import { cn } from "@/shared/utils/cn";
import { HISTORY_ACTION_STYLES, HISTORY_SOURCE_ICONS } from "../constants/history-ui";
import { ACTION_LABELS, ENTITY_LABELS, SOURCE_LABELS } from "../lib/history-view";
import { formatHistoryTime } from "../lib/history-timeline";
import type { HistoryEntry } from "@/shared/api/types";
import { HistoryChanges } from "./HistoryChanges";

interface HistoryTimelineItemProps {
  entry: HistoryEntry;
  labels: Record<string, string>;
  showRecord?: boolean;
}

export function HistoryTimelineItem({ entry, labels, showRecord }: HistoryTimelineItemProps) {
  const action = HISTORY_ACTION_STYLES[entry.action];
  const ActionIcon = action.icon;
  const SourceIcon = HISTORY_SOURCE_ICONS[entry.source];

  return (
    <li className="relative pb-4 pl-10 last:pb-0">
      <span aria-hidden="true" className={cn("absolute top-3 left-0 flex size-7 items-center justify-center rounded-full ring-4 ring-background", action.className)}>
        <ActionIcon className="size-3.5" />
      </span>
      <article className="min-w-0 space-y-4 rounded-lg border bg-card p-4">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className={action.className}>{ACTION_LABELS[entry.action]}</Badge>
            <time dateTime={entry.createdAt} className="text-xs tabular-nums text-muted-foreground">{formatHistoryTime(entry.createdAt)}</time>
          </div>
          {showRecord && (
            <p className="text-sm font-medium wrap-anywhere">
              {ENTITY_LABELS[entry.entity] ?? entry.entity}{entry.title ? ` · ${entry.title}` : ""}
            </p>
          )}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <SourceIcon aria-hidden="true" className="size-3.5" />
            {SOURCE_LABELS[entry.source]}
          </p>
        </header>
        <HistoryChanges entry={entry} labels={labels} />
      </article>
    </li>
  );
}
