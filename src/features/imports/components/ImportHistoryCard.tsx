import type { ImportHistoryCardProps } from "../types/import-types";
import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { formatDate } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { BATCH_STATUS } from "@/features/imports/constants/import-options";
import { filterHistory, type HistoryFilter } from "../lib/import-view";
import { useImportHistoryActions } from "../hooks/useImportHistoryActions";

export function ImportHistoryCard({
  items,
  current,
  onSelect,
  onClose,
}: ImportHistoryCardProps) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const visible = filterHistory(items, filter);
  const { deletingItem, setDeletingItem, deleting, confirmRemove } =
    useImportHistoryActions();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-base">Historial</CardTitle>
        <div className="flex items-center gap-1">
          <div
            role="tablist"
            aria-label="Filtrar historial"
            className="inline-flex rounded-lg bg-muted p-0.5 text-xs"
          >
            {(
              [
                ["all", "Todos"],
                ["pending", "Pendientes"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded-md px-2 py-1 font-medium ${filter === value ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Cerrar historial"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {filter === "pending"
              ? "No hay nada pendiente."
              : "Todavía no subiste nada."}
          </p>
        )}
        {visible.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm ${item.key === current ? "bg-muted" : ""}`}
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onSelect(item.key)}
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-muted-foreground">
                {" "}
                · {formatDate(item.createdAt)}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {item.detail}
              </span>
            </button>
            <Badge variant={item.pending ? "default" : "secondary"}>
              {BATCH_STATUS[item.status] ?? item.status}
            </Badge>
            {(item.source === "statement" || item.pending) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label={`Eliminar ${item.title}`}
                disabled={deleting}
                onClick={() => setDeletingItem(item)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
      <DeleteConfirmationDialog
        open={deletingItem !== null}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title={
          deletingItem?.source === "notion"
            ? "¿Descartar previsualización?"
            : "¿Eliminar estado de cuenta?"
        }
        description={
          <>
            {deletingItem?.source === "notion"
              ? `Se descartará la previsualización «${deletingItem.title}». No se importará ningún registro.`
              : `Se eliminará del historial el estado de cuenta «${deletingItem?.title ?? ""}». Los gastos que creó se conservarán.`}{" "}
            Esta acción no se puede deshacer.
          </>
        }
        pending={deleting}
        onConfirm={confirmRemove}
      />
    </Card>
  );
}
