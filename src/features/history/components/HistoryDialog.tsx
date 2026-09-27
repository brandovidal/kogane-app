import { useState } from "react";
import { ChevronDown, History, RotateCw } from "lucide-react";

import { useRecordHistory } from "@/features/history/hooks/history";
import { HISTORY_INITIAL_VISIBLE_COUNT } from "../constants/history-ui";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { Button } from "@/ui/button";

import { HistoryTimeline } from "./HistoryTimeline";
import { HistoryTimelineLoading } from "./HistoryTimelineLoading";

interface HistoryDialogProps {
  title: string; // what the record is called ("Uber")
  entity: string; // the table: exp_fixed_costs
  id: string;
  onClose: () => void;
}

// The timeline of one record, from the ⋯ of its row (P29)
export function HistoryDialog({ title, entity, id, onClose }: HistoryDialogProps) {
  const { data, isLoading, isError, isFetching, refetch } = useRecordHistory(entity, id);
  const [expanded, setExpanded] = useState(false);
  const entries = data?.items ?? [];
  const visibleEntries = expanded ? entries : entries.slice(0, HISTORY_INITIAL_VISIBLE_COUNT);

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Historial de ${title}`}
      icon={<History aria-hidden="true" className="size-4 shrink-0 text-primary" />}
      description="Revisa qué cambió, cuándo y desde dónde. Compara los valores anteriores con los nuevos."
      contentClassName="sm:max-w-2xl"
    >
      {isLoading ? (
        <HistoryTimelineLoading />
      ) : isError ? (
        <div className="space-y-3 rounded-lg border p-4">
          <p role="alert" className="text-sm text-destructive">No se pudo leer el historial.</p>
          <Button type="button" variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>
            <RotateCw aria-hidden="true" className="size-3.5" /> Reintentar
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center">
          <History aria-hidden="true" className="mx-auto mb-3 size-5 text-muted-foreground" />
          <p className="text-sm font-medium">Sin cambios registrados</p>
          <p className="mt-1 text-sm text-muted-foreground">El registro puede ser anterior al historial o provenir de una importación.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{visibleEntries.length} de {data?.total ?? entries.length} cambios</span>
            <span>Más recientes primero · Hora de Lima</span>
          </div>
          <HistoryTimeline entries={visibleEntries} labels={data?.labels ?? {}} />
          {entries.length > HISTORY_INITIAL_VISIBLE_COUNT && !expanded && (
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setExpanded(true)}>
              <ChevronDown aria-hidden="true" className="size-3.5" /> Ver {entries.length - HISTORY_INITIAL_VISIBLE_COUNT} cambios anteriores
            </Button>
          )}
          {data && data.total > data.items.length && (
            <p className="text-xs text-muted-foreground">Se muestran los {data.items.length} cambios más recientes de {data.total}. El resto está en Configuración ▸ Historial.</p>
          )}
        </div>
      )}
    </ResponsiveDialog>
  );
}
