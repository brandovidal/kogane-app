import { MoreHorizontal, Pencil, Check, RotateCcw, X } from "lucide-react";

import type { StatementRow } from "@/shared/api/types";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

interface StatementRowActionsProps {
  row: StatementRow;
  onEdit: () => void;
  onSave: () => void;
  onIgnore: () => void;
  onRestore?: () => void;
  saving?: boolean;
}

export function StatementRowActions({
  row,
  onEdit,
  onSave,
  onIgnore,
  onRestore,
  saving,
}: StatementRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Acciones de fila">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="h-4 w-4" /> Editar
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={onSave} disabled={row.result === "created"}>
          <Check className="h-4 w-4" /> Guardar
        </DropdownMenuItem>

        {row.result === "ignored" ? (
          <DropdownMenuItem onSelect={onRestore}>
            <RotateCcw className="h-4 w-4" /> Volver
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={onIgnore} disabled={row.result === "created"}>
            <X className="h-4 w-4" /> Ignorar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
