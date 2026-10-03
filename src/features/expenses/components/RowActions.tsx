import { useState } from "react";
import {
  ArrowRightLeft,
  CalendarArrowDown,
  CalendarArrowUp,
  Check,
  Copy,
  History,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react";

import type { AttachmentRefType } from "@/shared/api/types";
import { HistoryDialog } from "@/features/history/components/HistoryDialog";
import { AttachmentsDialog } from "@/features/attachments/components/dialogs/AttachmentsDialog";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import {
  PaymentStatusMenu,
  type PaymentStatusMenuProps,
} from "./PaymentStatusMenu";

import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

import { isPaidStatus } from "@/features/expenses/lib/expense-actions";

export interface RowActionsProps {
  label: string; // what the row is, for the delete confirmation ("Uber")
  onEdit?: () => void;
  onDuplicate?: () => void;
  onNextMonth?: () => void;
  onPreviousMonth?: () => void;
  /** Labels of the target months, e.g. "Noviembre 2026", shown under "Transferir". */
  monthLabels?: { previous?: string; next?: string };
  onMove?: () => void; // Transferir la serie entre Costos fijos, Recurrentes y Plataformas
  onDelete?: () => void | Promise<unknown>;
  files?: { refType: AttachmentRefType; refId: string }; // boleta, recibo, contrato (P27, D100)
  history?: { entity: string; id: string }; // the table (exp_fixed_costs) and the row (P29)
  status?: PaymentStatusMenuProps;
  /** Open files / history somewhere else (e.g. a tab of the detail sheet) instead of the dialogs. */
  onOpenFiles?: () => void;
  onOpenHistory?: () => void;
}

// ⋯ of each row of the expense tables (like Notion): edit, duplicate, status, paid, next month and delete
export function RowActions({
  label,
  onEdit,
  onDuplicate,
  onNextMonth,
  onPreviousMonth,
  monthLabels,
  onMove,
  onDelete,
  files,
  history,
  status,
  onOpenFiles,
  onOpenHistory,
}: RowActionsProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete?.();
      setDeleteOpen(false);
    } catch {
      // The mutation reports the error; preserve the confirmation for retry.
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={`Acciones de ${label}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {onEdit && (
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Editar
            </DropdownMenuItem>
          )}
          {onDuplicate && (
            <DropdownMenuItem onSelect={onDuplicate}>
              <Copy /> Duplicar
            </DropdownMenuItem>
          )}
          {status &&
            !isPaidStatus(status.value) &&
            status.options.includes("paid") && (
              <DropdownMenuItem onSelect={() => status.onChange("paid")}>
                <Check /> Marcar como pagado
              </DropdownMenuItem>
            )}
          {status && <PaymentStatusMenu {...status} />}
          {(onNextMonth || onPreviousMonth || onMove) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowRightLeft /> Transferir
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {onPreviousMonth && (
                    <DropdownMenuItem onSelect={onPreviousMonth}>
                      <CalendarArrowDown />
                      <span className="flex flex-col">
                        Mover al mes anterior
                        {monthLabels?.previous && (
                          <span className="text-xs text-muted-foreground">{monthLabels.previous}</span>
                        )}
                      </span>
                    </DropdownMenuItem>
                  )}
                  {onNextMonth && (
                    <DropdownMenuItem onSelect={onNextMonth}>
                      <CalendarArrowUp />
                      <span className="flex flex-col">
                        Mover al siguiente mes
                        {monthLabels?.next && (
                          <span className="text-xs text-muted-foreground">{monthLabels.next}</span>
                        )}
                      </span>
                    </DropdownMenuItem>
                  )}
                  {onMove && (
                    <DropdownMenuItem onSelect={onMove}>
                      <ArrowRightLeft /> A otra sección…
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
          {files && (
            <DropdownMenuItem onSelect={() => (onOpenFiles ? onOpenFiles() : setFilesOpen(true))}>
              <Paperclip /> Archivos
            </DropdownMenuItem>
          )}
          {history && (
            <DropdownMenuItem onSelect={() => (onOpenHistory ? onOpenHistory() : setHistoryOpen(true))}>
              <History /> Historial
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 /> Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {history && historyOpen && (
        <HistoryDialog
          title={label}
          {...history}
          onClose={() => setHistoryOpen(false)}
        />
      )}
      {files && filesOpen && (
        <AttachmentsDialog
          title={label}
          {...files}
          onClose={() => setFilesOpen(false)}
        />
      )}
      {onDelete && (
        <DeleteConfirmationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`¿Eliminar «${label}»?`}
          description="Se eliminará el registro y sus archivos. Esta acción no se puede deshacer."
          pending={deleting}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </>
  );
}
