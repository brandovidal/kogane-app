import { useState } from "react";
import {
  ChevronDown,
  CircleCheck,
  Copy,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { BulkActionsToolbar } from "@/shared/components/toolbar/BulkActionsToolbar";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { groupPaymentStatuses } from "@/features/expenses/lib/group-payment-statuses";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { FIXED_COST_STATUSES } from "../constants/statuses";
import type { useFixedCostBulkActions } from "../hooks/useFixedCostBulkActions";

export function FixedCostBulkActionsSection({
  bulk,
}: {
  bulk: ReturnType<typeof useFixedCostBulkActions>;
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
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin text-muted-foreground"
          />
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={bulk.pending}
          onClick={() => void bulk.run("duplicate")}
        >
          <Copy aria-hidden="true" className="size-4" />
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
              <CircleCheck aria-hidden="true" className="size-4" />
              Estado
              <ChevronDown aria-hidden="true" className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {groupPaymentStatuses(FIXED_COST_STATUSES).map((group, index) => (
              <div key={group.label}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {group.label}
                </DropdownMenuLabel>
                {group.options.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onSelect={() => void bulk.run("status", status)}
                  >
                    <StatusBadge status={status} />
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={bulk.pending}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Eliminar
        </Button>
      </BulkActionsToolbar>
      {bulk.failures.length > 0 && (
        <div
          role="alert"
          className="space-y-1 rounded-lg border border-destructive/30 p-3 text-sm"
        >
          <p className="font-medium">Registros pendientes de procesar</p>
          <ul className="list-inside list-disc text-muted-foreground">
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
        title={`¿Eliminar ${count} ${count === 1 ? "costo fijo" : "costos fijos"}?`}
        description="Se eliminarán los registros seleccionados y sus archivos. Esta acción no se puede deshacer."
        pending={bulk.pending}
        onConfirm={() =>
          void bulk.run("delete").then(() => setDeleteOpen(false))
        }
      />
    </>
  );
}
