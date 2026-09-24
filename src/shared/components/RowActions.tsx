import { CalendarArrowUp, Check, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { PAYMENT_STATUS_LABELS } from "@/shared/labels";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

import { isPaidStatus } from "@/shared/lib/expense-actions";

interface RowActionsProps {
  label: string; // what the row is, for the delete confirmation ("Uber")
  onEdit?: () => void;
  onDuplicate?: () => void;
  onNextMonth?: () => void;
  onDelete?: () => void;
  status?: { value: string; options: readonly string[]; onChange: (status: string) => void };
}

// ⋯ of each row of the expense tables (like Notion): edit, duplicate, status, paid, next month and delete
export function RowActions({ label, onEdit, onDuplicate, onNextMonth, onDelete, status }: RowActionsProps) {
  const confirmDelete = () => {
    if (window.confirm(`¿Eliminar «${label}»? No se puede deshacer.`)) onDelete?.();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Acciones de ${label}`}>
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
        {status && !isPaidStatus(status.value) && status.options.includes("paid") && (
          <DropdownMenuItem onSelect={() => status.onChange("paid")}>
            <Check /> Marcar como pagado
          </DropdownMenuItem>
        )}
        {status && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Estado: {PAYMENT_STATUS_LABELS[status.value] ?? status.value}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={status.value} onValueChange={status.onChange}>
                {status.options.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {PAYMENT_STATUS_LABELS[option] ?? option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        {onNextMonth && (
          <DropdownMenuItem onSelect={onNextMonth}>
            <CalendarArrowUp /> Pasar al mes siguiente
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={confirmDelete}>
              <Trash2 /> Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
