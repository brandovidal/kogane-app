import { useState } from "react";

import { useRecordHistory } from "@/shared/api/hooks/history";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { Button } from "@/ui/button";

import { HistoryTimeline } from "./HistoryTimeline";

interface HistoryDialogProps {
  title: string; // what the record is called ("Uber")
  entity: string; // the table: exp_fixed_costs
  id: string;
  onClose: () => void;
}

// The timeline of one record, from the ⋯ of its row (P29)
export function HistoryDialog({ title, entity, id, onClose }: HistoryDialogProps) {
  const { data, isLoading, isError } = useRecordHistory(entity, id);
  const [expanded, setExpanded] = useState(false);
  const entries = data?.items ?? [];

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Historial de ${title}`}
      description="Qué cambió, cuándo y desde dónde (web, bot, importación o automático)."
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">No se pudo leer el historial.</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin cambios registrados: este registro es anterior al historial o vino de una importación.</p>
      ) : (
        <div className="space-y-3">
          <HistoryTimeline entries={expanded ? entries : entries.slice(0, 10)} labels={data?.labels ?? {}} />
          {entries.length > 10 && !expanded && (
            <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
              Ver los {entries.length - 10} anteriores
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
