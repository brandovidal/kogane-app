import { formatDate } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { BATCH_STATUS } from "@/features/imports/constants/import-options";
import type { HistoryItem } from "../types/import-types";

// «Recientes» junto a la carga (boards I1–I6)
export function ImportRecents({
  items,
  limit = 3,
  onSelect,
  onViewAll,
}: {
  items: HistoryItem[];
  limit?: number;
  onSelect: (key: string) => void;
  onViewAll: () => void;
}) {
  return (
    <aside className="space-y-2" aria-label="Recientes">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Recientes
        </h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs text-primary hover:underline"
          >
            Ver historial
          </button>
        )}
      </div>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Todavía no subiste nada.
        </p>
      )}
      {items.slice(0, limit).map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(item.key)}
          className="flex w-full items-center gap-2 rounded-xl border bg-card px-3 py-2 text-left hover:bg-muted/40"
        >
          <span className="min-w-0 flex-1">
            <b className="block truncate text-sm">{item.title}</b>
            <span className="block truncate text-xs text-muted-foreground">
              {formatDate(item.createdAt)} · {item.detail}
            </span>
          </span>
          <Badge variant={item.pending ? "default" : "secondary"}>
            {BATCH_STATUS[item.status] ?? item.status}
          </Badge>
        </button>
      ))}
    </aside>
  );
}
