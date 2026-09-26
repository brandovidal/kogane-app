import { useState } from "react";

import type { StatementRow } from "@/shared/api/types";
import { PersonSelect } from "@/shared/components/CatalogSelect";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";

export interface RowChanges {
  label: string | null;
  personId?: string | null; // only when it changed
}

interface EditRowDialogProps {
  row: StatementRow;
  onClose: () => void;
  onSave: (changes: RowChanges) => void;
  saving?: boolean;
}

// Mounted per row (keyed by id), so the fields start with that row's values.
export function EditRowDialog({ row, onClose, onSave, saving }: EditRowDialogProps) {
  const [value, setValue] = useState(row.label ?? "");
  const [personId, setPersonId] = useState<string | null>(row.personId);
  const save = () => onSave({ label: value.trim() || null, ...(personId !== row.personId ? { personId } : {}) });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar movimiento</DialogTitle>
          <DialogDescription>Tu descripción y de quién es. El texto del banco es el que se usa para coincidir.</DialogDescription>
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Persona</label>
            <PersonSelect value={personId} onChange={setPersonId} />
            <p className="text-xs text-muted-foreground">
              Al guardar, la persona se actualiza también en el gasto de Kogane si ya estaba vinculado.
            </p>
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
