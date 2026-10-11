import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import { useSaveStatementPassword } from "../hooks/statementPassword";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

// "Contraseña del PDF" of a card: statements of this card open with it, so uploading them never asks again
export function CardStatementPassword({
  cardId,
  hasPassword,
}: {
  cardId: string;
  hasPassword: boolean;
}) {
  const save = useSaveStatementPassword();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="card-statement-password"
        className="flex items-center gap-1.5 text-sm font-medium"
      >
        <LockKeyhole className="size-4" /> Contraseña del estado de cuenta
      </label>
      <div className="flex gap-2">
        <Input
          id="card-statement-password"
          type={visible ? "text" : "password"}
          autoComplete="off"
          placeholder={
            hasPassword ? "Guardada (escribe otra para cambiarla)" : "Opcional"
          }
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!password || save.isPending}
          onClick={() =>
            save.mutate(
              { id: cardId, password },
              { onSuccess: () => setPassword("") },
            )
          }
        >
          Guardar
        </Button>
        {hasPassword && (
          <Button
            type="button"
            variant="ghost"
            disabled={save.isPending}
            onClick={() => save.mutate({ id: cardId, password: null })}
          >
            Quitar
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Se guarda aparte y nunca se muestra de nuevo. Los PDF de esta tarjeta se
        abren con ella.
      </p>
    </div>
  );
}
