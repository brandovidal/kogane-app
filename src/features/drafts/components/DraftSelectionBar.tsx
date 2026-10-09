import { Check, Trash2, X } from "lucide-react";
import { Button } from "@/ui/button";
import type { SelectionSummary } from "@/features/drafts/lib/draft-filters";

// Barra flotante de la selección múltiple (board B3)
export function DraftSelectionBar({
  summary,
  busy = false,
  onSaveReady,
  onDiscard,
  onClear,
}: {
  summary: SelectionSummary<unknown>;
  busy?: boolean;
  onSaveReady: () => void;
  onDiscard: () => void;
  onClear: () => void;
}) {
  if (!summary.count) return null;
  return (
    <div
      role="region"
      aria-label="Acciones de la selección"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-3 rounded-2xl border bg-popover px-4 py-3 shadow-lg"
    >
      <div className="min-w-0 flex-1">
        <b className="text-sm">
          {summary.count}{" "}
          {summary.count === 1 ? "seleccionado" : "seleccionados"}
        </b>
        {summary.incomplete > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {summary.incomplete}{" "}
            {summary.incomplete === 1
              ? "incompleto no se guardará"
              : "incompletos no se guardarán"}
          </p>
        )}
      </div>
      <Button
        size="sm"
        onClick={onSaveReady}
        disabled={busy || summary.ready.length === 0}
      >
        <Check className="size-4" /> Guardar listos ({summary.ready.length})
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={onDiscard}
        disabled={busy}
      >
        <Trash2 className="size-4" /> Descartar
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        aria-label="Quitar selección"
        onClick={onClear}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
