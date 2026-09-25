import { Check, MoreHorizontal, Pencil, RotateCcw, X } from "lucide-react";

import type { StatementRow } from "@/shared/api/types";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";

import { rowName } from "../statement-view";

interface StatementRowActionsProps {
  row: StatementRow;
  onEdit: () => void;
  onSave: () => void;
  onIgnore: () => void;
  onRestore: () => void;
  saving?: boolean;
}

// ⋯ of a statement row (Nuevos and Coinciden): edit your description, save it as an expense, ignore or bring it back
export function StatementRowActions({ row, onEdit, onSave, onIgnore, onRestore, saving }: StatementRowActionsProps) {
  const created = row.result === "created";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Acciones de ${rowName(row)}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSave} disabled={created || saving}>
          <Check /> Guardar
        </DropdownMenuItem>
        {row.result === "ignored" ? (
          <DropdownMenuItem onSelect={onRestore} disabled={saving}>
            <RotateCcw /> Volver
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={onIgnore} disabled={created || saving}>
            <X /> Ignorar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
