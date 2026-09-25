import { useState } from "react";

import type { StatementRow } from "@/shared/api/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

interface EditRowDialogProps {
  row: StatementRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (label: string) => void;
  saving?: boolean;
}

export function EditRowDialog({ row, open, onOpenChange, onSave, saving }: EditRowDialogProps) {
  const [value, setValue] = useState(row?.label ?? "");

  const handleSave = () => {
    onSave(value.trim() || null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar descripción</DialogTitle>
          <DialogDescription>Tu descripción de este movimiento. El texto del banco es solo referencia.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="label" className="text-sm font-medium">Tu descripción</label>
            <Input
              id="label"
              placeholder={row?.description}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") onOpenChange(false);
              }}
              autoFocus
            />
          </div>

          <div className="space-y-1 rounded-sm bg-muted p-3 text-sm">
            <p className="font-medium text-muted-foreground">Texto del banco (no se edita)</p>
            <p className="break-words">{row?.description}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
