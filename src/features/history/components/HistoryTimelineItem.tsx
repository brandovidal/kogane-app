import { Badge } from "@/ui/badge";
import { cn } from "@/shared/utils/cn";
import { HISTORY_ACTION_STYLES, HISTORY_SOURCE_ICONS } from "../constants/history-ui";
import { ACTION_LABELS, ENTITY_LABELS, SOURCE_LABELS, fieldLabel } from "../lib/history-view";
import { formatHistoryTime } from "../lib/history-timeline";
import type { HistoryEntry } from "@/shared/api/types";
import { HistoryChanges } from "./HistoryChanges";

interface HistoryTimelineItemProps {
  entry: HistoryEntry;
  labels: Record<string, string>;
  showRecord?: boolean;
  compact?: boolean;
}

export function HistoryTimelineItem({ entry, labels, showRecord, compact = false }: HistoryTimelineItemProps) {
  const action = HISTORY_ACTION_STYLES[entry.action];
  const ActionIcon = action.icon;
  const SourceIcon = HISTORY_SOURCE_ICONS[entry.source];
  const title = compact && entry.action === "update" && entry.changes.length === 1
    ? fieldLabel(entry.changes[0].field)
    : ACTION_LABELS[entry.action];

  return (
    <li className={cn("relative last:pb-0", compact ? "pb-3 pl-8" : "pb-4 pl-10")}>
      <span aria-hidden="true" className={cn("absolute left-0 flex items-center justify-center rounded-full ring-4 ring-background", compact ? "top-1 size-6" : "top-3 size-7", action.className)}>
        <ActionIcon className="size-3.5" />
      </span>
      <article className={cn("min-w-0", compact ? "space-y-2" : "space-y-4 rounded-lg border bg-card p-4")}>
        <header className={cn(compact ? "flex flex-wrap items-center justify-between gap-x-3 gap-y-1" : "space-y-2")}>
          <div className={cn("flex flex-wrap items-center gap-2", compact ? "w-full" : "justify-between")}>
            {compact ? <span className="text-sm font-semibold">{title}</span> : <Badge variant="secondary" className={action.className}>{ACTION_LABELS[entry.action]}</Badge>}
            {compact && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><SourceIcon aria-hidden="true" className="size-3.5" />{SOURCE_LABELS[entry.source]}</span>}
            <time dateTime={entry.createdAt} className={cn("text-xs tabular-nums text-muted-foreground", compact && "ml-auto")}>{formatHistoryTime(entry.createdAt)}</time>
          </div>
          {showRecord && (
            <p className="text-sm font-medium wrap-anywhere">
              {ENTITY_LABELS[entry.entity] ?? entry.entity}{entry.title ? ` · ${entry.title}` : ""}
            </p>
          )}
          {!compact && <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <SourceIcon aria-hidden="true" className="size-3.5" />
            {SOURCE_LABELS[entry.source]}
          </p>}
        </header>
        <HistoryChanges entry={entry} labels={labels} compact={compact} />
      </article>
    </li>
  );
}
