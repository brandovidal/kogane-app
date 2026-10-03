import { History } from "lucide-react";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { RecordHistoryPanel } from "./RecordHistoryPanel";

export interface HistoryDialogProps {
  title: string;
  entity: string;
  id: string;
  onClose: () => void;
}

export function HistoryDialog({
  title,
  entity,
  id,
  onClose,
}: HistoryDialogProps) {
  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Historial de ${title}`}
      icon={
        <History aria-hidden="true" className="size-4 shrink-0 text-primary" />
      }
      description="Revisa qué cambió, cuándo y desde dónde. Compara los valores anteriores con los nuevos."
      contentClassName="sm:max-w-2xl"
    >
      <RecordHistoryPanel key={id} entity={entity} id={id} />
    </ResponsiveDialog>
  );
}
