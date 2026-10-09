import { useEffect, useMemo, useState } from "react";
import { History, RotateCw } from "lucide-react";
import type { HistoryEntry, HistoryPage } from "@/shared/api/types";
import { useRecordHistory } from "@/features/history/hooks/history";
import { Button } from "@/ui/button";
import { HistoryTimeline } from "./HistoryTimeline";
import { HistoryTimelineLoading } from "./HistoryTimelineLoading";

type HistoryFilter = "all" | "edits" | "status" | "files";
const FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "edits", label: "Ediciones" },
  { id: "status", label: "Estado" },
  { id: "files", label: "Archivos" },
];

export interface RecordHistoryPanelProps {
  entity: string;
  id: string;
  compact?: boolean;
}

export function RecordHistoryPanel({
  entity,
  id,
  compact = false,
}: RecordHistoryPanelProps) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [page, setPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState<Record<number, HistoryPage>>(
    {},
  );
  const query = useRecordHistory(entity, id, { page });

  useEffect(() => {
    if (query.data) {
      setLoadedPages((previous) => ({
        ...previous,
        [query.data.page]: query.data,
      }));
    }
  }, [query.data]);

  const pages = useMemo(() => {
    const byPage = { ...loadedPages };
    if (query.data) byPage[query.data.page] = query.data;
    return Object.values(byPage);
  }, [loadedPages, query.data]);
  const entries = useMemo(() => {
    const unique = new Map<string, HistoryEntry>();
    for (const result of pages)
      for (const entry of result.items) unique.set(entry.id, entry);
    return [...unique.values()].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  }, [pages]);
  const labels = useMemo(
    () => Object.assign({}, ...pages.map((result) => result.labels)),
    [pages],
  );
  const total = query.data?.total ?? pages[0]?.total ?? entries.length;
  const pageSize = query.data?.pageSize ?? pages[0]?.pageSize ?? 10;
  const filteredEntries = entries.filter((entry) =>
    matchesFilter(entry, filter),
  );
  const hasMore = entries.length < total;
  const hasLoadedEntries = entries.length > 0;

  return (
    <div className="space-y-4">
      {query.isLoading && !hasLoadedEntries ? (
        <HistoryTimelineLoading />
      ) : query.isError && !hasLoadedEntries ? (
        <div className="space-y-3 rounded-lg border p-4">
          <p role="alert" className="text-sm text-destructive">
            No se pudo leer el historial.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RotateCw aria-hidden="true" className="size-3.5" /> Reintentar
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center">
          <History
            aria-hidden="true"
            className="mx-auto mb-3 size-5 text-muted-foreground"
          />
          <p className="text-sm font-medium">Sin cambios registrados</p>
          <p className="mt-1 text-sm text-muted-foreground">
            El registro puede ser anterior al historial o provenir de una
            importación.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-muted/70 p-1"
              role="group"
              aria-label="Filtrar historial"
            >
              {FILTERS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={filter === item.id ? "secondary" : "ghost"}
                  className="h-7 shrink-0 px-2.5 text-xs"
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              Hora de Lima
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>
                {entries.length} de {total} cambios
              </span>
              <span>Más recientes primero</span>
            </div>
            {filteredEntries.length ? (
              <HistoryTimeline
                entries={filteredEntries}
                labels={labels}
                compact={compact}
              />
            ) : (
              <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                No hay cambios para este filtro.
              </p>
            )}
            {query.isError && hasLoadedEntries && (
              <p role="alert" className="text-sm text-destructive">
                No se pudieron cargar más cambios. Inténtalo de nuevo.
              </p>
            )}
            {hasMore && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={query.isFetching}
                onClick={() =>
                  query.isError
                    ? void query.refetch()
                    : setPage((current) => current + 1)
                }
              >
                {query.isFetching
                  ? "Cargando cambios…"
                  : query.isError
                    ? "Reintentar carga"
                    : `Cargar ${Math.min(pageSize, total - entries.length)} cambios más`}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function matchesFilter(entry: HistoryEntry, filter: HistoryFilter) {
  if (filter === "all") return true;
  const fields = entry.changes.map((change) => change.field.toLowerCase());
  const isStatus = fields.some(
    (field) => field === "status" || field === "paymentstatus",
  );
  const isFile = fields.some((field) => /attachment|file|notes?/i.test(field));
  if (filter === "status") return isStatus;
  if (filter === "files") return isFile;
  return entry.action === "update" && !isStatus && !isFile;
}
