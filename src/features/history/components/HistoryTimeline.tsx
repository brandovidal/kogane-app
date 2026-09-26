import { Bot, Clock, Globe, PackageOpen, Terminal } from "lucide-react";

import type { HistoryEntry } from "@/shared/api/types";
import { Badge } from "@/ui/badge";

import { ACTION_LABELS, describeChanges, ENTITY_LABELS, SOURCE_LABELS, SUMMARY_FIELDS } from "../history-view";

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  web: Globe,
  bot: Bot,
  import: PackageOpen,
  scheduler: Clock,
  cli: Terminal,
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", { timeZone: "America/Lima", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

interface HistoryTimelineProps {
  entries: HistoryEntry[];
  labels: Record<string, string>;
  showRecord?: boolean; // the global list says which record each change is of
}

// One line per change: when, from where and what changed ("Monto: 1,000.00 → 1,042.00"); a delete keeps the whole row
export function HistoryTimeline({ entries, labels, showRecord }: HistoryTimelineProps) {
  return (
    <ol className="space-y-3">
      {entries.map((entry) => {
        const Icon = SOURCE_ICONS[entry.source] ?? Terminal;
        const lines = describeChanges(entry.action, entry.changes, labels);
        const summary = entry.action === "update" ? lines : lines.filter((line) => SUMMARY_FIELDS.includes(line.field));
        const rest = entry.action === "update" ? [] : lines.filter((line) => !SUMMARY_FIELDS.includes(line.field));
        return (
          <li key={entry.id} className="flex gap-3 rounded-md border p-3 text-sm">
            <span title={SOURCE_LABELS[entry.source] ?? entry.source} className="mt-0.5 shrink-0 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="sr-only">{SOURCE_LABELS[entry.source] ?? entry.source}</span>
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Badge variant={entry.action === "delete" ? "destructive" : "secondary"}>{ACTION_LABELS[entry.action] ?? entry.action}</Badge>
                {showRecord && (
                  <span className="font-medium">
                    {ENTITY_LABELS[entry.entity] ?? entry.entity}
                    {entry.title ? ` · ${entry.title}` : ""}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {when(entry.createdAt)} · {SOURCE_LABELS[entry.source] ?? entry.source}
                </span>
              </div>
              {summary.length > 0 && (
                <ul className="space-y-0.5">
                  {summary.map((line) => (
                    <li key={line.field}>
                      <span className="text-muted-foreground">{line.label}: </span>
                      {entry.action === "update" ? (
                        <>
                          <span className="text-muted-foreground line-through decoration-muted-foreground/50">{line.before}</span>
                          {" → "}
                          <span className="font-medium">{line.after}</span>
                        </>
                      ) : (
                        <span className="font-medium">{entry.action === "delete" ? line.before : line.after}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {rest.length > 0 && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer select-none">{entry.action === "delete" ? "Fila completa" : "Todos los campos"}</summary>
                  <ul className="mt-1 space-y-0.5">
                    {rest.map((line) => (
                      <li key={line.field}>
                        {line.label}: {entry.action === "delete" ? line.before : line.after}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
