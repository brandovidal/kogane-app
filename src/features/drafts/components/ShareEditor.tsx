import { Plus, Trash2 } from "lucide-react";

import type { DraftFields } from "@/shared/api/hooks/drafts";
import { PersonSelect } from "@/shared/components/CatalogSelect";
import { formatCurrency } from "@/shared/lib/currency";
import { shareParts, type ExpenseShare } from "@/shared/lib/shared-expense";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

interface ShareEditorProps {
  value: DraftFields["sharedWith"];
  total: number | null | undefined;
  currency: string;
  onChange: (value: DraftFields["sharedWith"]) => void;
}

type Mode = "percent" | "amount";

// Reparto (D73, D78): you pay it all and each person owes a percentage or an amount of it
export function ShareEditor({ value, total, currency, onChange }: ShareEditorProps) {
  const shares: ExpenseShare[] = value?.shares ?? [];
  const { parts, own } = shareParts(total ?? 0, shares);
  const update = (next: ExpenseShare[]) => onChange(next.length ? { shares: next } : null);
  const setShare = (index: number, share: ExpenseShare) => update(shares.map((item, position) => (position === index ? share : item)));

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Reparto</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => update([...shares, { personId: "", ratio: 0.5 }])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Agregar persona
        </Button>
      </div>
      {!shares.length && <p className="text-xs text-muted-foreground">Sin compartir: todo es tuyo.</p>}
      {shares.map((share, index) => {
        const mode: Mode = share.amount != null ? "amount" : "percent";
        const shown = mode === "amount" ? share.amount : Math.round((share.ratio ?? 0) * 10000) / 100;
        return (
          <div key={index} className="grid grid-cols-[1fr_90px_80px_auto] items-center gap-2">
            <PersonSelect value={share.personId || null} onChange={(id) => setShare(index, { ...share, personId: id ?? "" })} />
            <Input
              type="number"
              step="0.01"
              min="0"
              value={shown ?? ""}
              onChange={(event) => {
                const number = Number(event.target.value);
                setShare(index, mode === "amount" ? { personId: share.personId, amount: number } : { personId: share.personId, ratio: number / 100 });
              }}
            />
            <Select
              value={mode}
              onValueChange={(next) =>
                setShare(index, next === "amount" ? { personId: share.personId, amount: parts[index]?.amount ?? 0 } : { personId: share.personId, ratio: (parts[index]?.percent ?? 50) / 100 })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="amount">{currency === "USD" ? "US$" : "S/"}</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="ghost" size="icon" aria-label="Quitar" onClick={() => update(shares.filter((_, position) => position !== index))}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      })}
      {shares.length > 0 && total ? (
        <p className="text-xs text-muted-foreground">
          Pagas {formatCurrency(total, currency)} · te deben {formatCurrency(total - own, currency)} · tu parte {formatCurrency(own, currency)}
        </p>
      ) : null}
    </div>
  );
}
