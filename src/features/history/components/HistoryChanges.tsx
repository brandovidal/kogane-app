import { ChevronDown } from "lucide-react";
import type { HistoryEntry } from "@/shared/api/types";
import { describeChanges, SUMMARY_FIELDS } from "../lib/history-view";
import { HistoryValue } from "./HistoryValue";

interface HistoryChangesProps {
  entry: HistoryEntry;
  labels: Record<string, string>;
  compact?: boolean;
}

export function HistoryChanges({ entry, labels, compact = false }: HistoryChangesProps) {
  const lines = describeChanges(entry.action, entry.changes, labels);
  const rawChanges = new Map(entry.changes.map((change) => [change.field, change]));

  if (lines.length === 0) {
    return <p className="text-xs text-muted-foreground">No hay detalles de campos en este evento.</p>;
  }

  if (entry.action === "update") {
    if (compact) {
      return (
        <div className="space-y-2">
          {lines.map((line) => (
            <div key={line.field} className="min-w-0">
              {lines.length > 1 && <p className="mb-1 text-xs text-muted-foreground">{line.label}</p>}
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                <span className="whitespace-pre-wrap wrap-anywhere text-muted-foreground line-through decoration-muted-foreground/40">{line.before}</span>
                <span aria-hidden="true" className="text-muted-foreground">→</span>
                <span className="min-w-0 font-medium"><HistoryValue field={line.field} rawValue={rawChanges.get(line.field)?.after} formattedValue={line.after} /></span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="overflow-hidden rounded-md border text-sm">
        <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:grid">
          <span>Campo</span><span>Antes</span><span>Después</span>
        </div>
        <dl className="divide-y">
          {lines.map((line) => (
            <div key={line.field} className="grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-2.5 sm:grid-cols-3">
              <dt className="col-span-2 text-xs text-muted-foreground sm:col-span-1 sm:text-sm">{line.label}</dt>
              <dd className="min-w-0 text-muted-foreground">
                <span className="mb-1 block text-xs sm:sr-only">Antes</span>
                <span className="whitespace-pre-wrap wrap-anywhere line-through decoration-muted-foreground/40">{line.before}</span>
              </dd>
              <dd className="min-w-0 font-medium">
                <span className="mb-1 block text-xs font-normal text-muted-foreground sm:sr-only">Después</span>
                <HistoryValue field={line.field} rawValue={rawChanges.get(line.field)?.after} formattedValue={line.after} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  const preferred = lines.filter((line) => SUMMARY_FIELDS.includes(line.field));
  const summary = preferred.length > 0 ? preferred : lines.slice(0, 6);
  const visibleFields = new Set(summary.map((line) => line.field));
  const rest = lines.filter((line) => !visibleFields.has(line.field));
  const side = entry.action === "delete" ? "before" : "after";

  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {summary.map((line) => (
          <div key={line.field} className="min-w-0 space-y-1">
            <dt className="text-xs text-muted-foreground">{line.label}</dt>
            <dd className="text-sm font-medium">
              <HistoryValue field={line.field} rawValue={rawChanges.get(line.field)?.[side]} formattedValue={line[side]} />
            </dd>
          </div>
        ))}
      </dl>
      {rest.length > 0 && (
        <details className="group border-t pt-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <ChevronDown aria-hidden="true" className="size-3.5 transition-transform group-open:rotate-180" />
            Ver {rest.length} {rest.length === 1 ? "campo adicional" : "campos adicionales"}
          </summary>
          <dl className="mt-3 space-y-2">
            {rest.map((line) => (
              <div key={line.field} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 text-sm">
                <dt className="text-xs text-muted-foreground">{line.label}</dt>
                <dd className="min-w-0">
                  <HistoryValue field={line.field} rawValue={rawChanges.get(line.field)?.[side]} formattedValue={line[side]} />
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}
