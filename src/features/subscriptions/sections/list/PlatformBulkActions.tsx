import { useState } from "react";
import { Copy, Download, LoaderCircle, Trash2 } from "lucide-react";
import { BulkActionsToolbar } from "@/shared/components/toolbar/BulkActionsToolbar";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { SUBSCRIPTION_STATUSES } from "../../constants/subscriptions";
import type { usePlatformBulkActions } from "../../hooks/usePlatformBulkActions";

export function PlatformBulkActions({
  bulk,
  onExport,
}: {
  bulk: ReturnType<typeof usePlatformBulkActions>;
  onExport: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const count = bulk.selectedItems.length;
  return (
    <>
      <BulkActionsToolbar
        count={count}
        pending={bulk.pending}
        onClear={bulk.clear}
      >
        {bulk.pending && (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={bulk.pending}
          onClick={() => void bulk.run("duplicate")}
        >
          <Copy className="size-4" />
          Duplicar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={bulk.pending}
            >
              Estado
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SUBSCRIPTION_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                onSelect={() => void bulk.run("status", status)}
              >
                <StatusBadge status={status} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={bulk.pending}
          onClick={onExport}
        >
          <Download className="size-4" />
          Exportar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={bulk.pending}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          Eliminar
        </Button>
      </BulkActionsToolbar>
      {bulk.failures.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 p-3 text-sm"
        >
          <p className="font-medium">Registros pendientes de procesar</p>
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            {bulk.failures.map((failure) => (
              <li key={failure.id}>
                {failure.name}: {failure.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`¿Eliminar ${count} ${count === 1 ? "plataforma" : "plataformas"}?`}
        description="Se eliminarán los registros seleccionados y sus archivos. Esta acción no se puede deshacer."
        pending={bulk.pending}
        onConfirm={() =>
          void bulk.run("delete").then(() => setDeleteOpen(false))
        }
      />
    </>
  );
}
