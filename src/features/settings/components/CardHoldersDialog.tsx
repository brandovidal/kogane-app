import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { useCardHolders, useSaveCardHolders, useMe } from "@/shared/api/hooks/catalogs";
import { PersonSelect } from "@/shared/components/CatalogSelect";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

interface Holder {
  personId: string | null;
  role: "titular" | "additional";
  last4: string;
}

// Titular y adicionales de una tarjeta (D116): the statement gives each purchase to them (CMR by the section of each
// card, Sip by its TIT/ADIC column). The last 4 digits are how the statement prints each card
export function CardHoldersDialog({ card, onClose }: { card: { id: string; name: string }; onClose: () => void }) {
  const { data } = useCardHolders(card.id);
  const me = useMe();
  const save = useSaveCardHolders();
  const [holders, setHolders] = useState<Holder[]>([]);

  useEffect(() => {
    if (!data) return;
    const rows = data.map((holder) => ({ personId: holder.personId, role: holder.role, last4: holder.last4 ?? "" }));
    setHolders(rows.length ? rows : [{ personId: me ?? null, role: "titular", last4: "" }]);
  }, [data, me]);

  const set = (index: number, change: Partial<Holder>) =>
    setHolders(holders.map((holder, at) => (at === index ? { ...holder, ...change } : holder)));
  const valid =
    holders.every((holder) => holder.personId && (!holder.last4 || /^\d{4}$/.test(holder.last4))) &&
    new Set(holders.map((holder) => holder.personId)).size === holders.length;

  const submit = () =>
    save.mutate(
      {
        id: card.id,
        holders: holders.map((holder) => ({ personId: holder.personId!, role: holder.role, last4: holder.last4 || null })),
      },
      { onSuccess: onClose },
    );

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${card.name}: titular y adicionales`}
      description="Al leer su estado de cuenta, cada compra va a la persona de su tarjeta; los cargos (seguro, intereses) al titular."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!valid || save.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-3 py-2">
        {holders.map((holder, index) => (
          <div key={index} className="grid grid-cols-[1fr_90px_32px] items-end gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{holder.role === "titular" ? "Titular" : "Adicional"}</label>
              <PersonSelect value={holder.personId} onChange={(personId) => set(index, { personId })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Últimos 4</label>
              <Input
                inputMode="numeric"
                maxLength={4}
                placeholder="1810"
                value={holder.last4}
                onChange={(event) => set(index, { last4: event.target.value.replace(/\D/g, "") })}
              />
            </div>
            {holder.role === "additional" ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Quitar adicional"
                onClick={() => setHolders(holders.filter((_, at) => at !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <span />
            )}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHolders([...holders, { personId: null, role: "additional", last4: "" }])}
        >
          <Plus className="mr-1 h-4 w-4" /> Agregar adicional
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
