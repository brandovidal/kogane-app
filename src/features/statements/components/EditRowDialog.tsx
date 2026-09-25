import { useState } from "react";

import type { StatementRow } from "@/shared/api/types";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";

interface EditRowDialogProps {
  row: StatementRow;
  onClose: () => void;
  onSave: (label: string | null) => void;
  saving?: boolean;
}

// Mounted per row (keyed by id), so the field starts with that row's description
export function EditRowDialog({ row, onClose, onSave, saving }: EditRowDialogProps) {
  const [value, setValue] = useState(row.label ?? "");
  const save = () => onSave(value.trim() || null);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar descripción</DialogTitle>
          <DialogDescription>Tu descripción de este movimiento. El texto del banco es el que se usa para coincidir.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="statement-row-label" className="text-sm font-medium">
              Tu descripción
            </label>
            <Input
              id="statement-row-label"
              autoFocus
              placeholder={row.description}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") save();
              }}
            />
          </div>
          <div className="space-y-1 rounded-md bg-muted p-3 text-sm">
            <p className="font-medium text-muted-foreground">Texto del banco (no se edita)</p>
            <p className="break-words">{row.description}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={saving}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
