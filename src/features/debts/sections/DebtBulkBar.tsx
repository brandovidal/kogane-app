import { useState } from "react";
import { Ban, Copy, CreditCard, HandCoins, MoreHorizontal, RotateCcw, Trash2, Undo2, Wallet, X } from "lucide-react";

import { useBulkDebts, type DebtBulk } from "@/shared/api/hooks/debts";
import type { Debt } from "@/shared/api/types";
import { PaymentMethodSelect } from "@/shared/components/CatalogSelect";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName, toIsoDate } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

type Asking = "partial" | "clone" | "card" | "delete" | "reset" | null;

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

// Selección múltiple (D115): what to do with the checked debts. Paying, amortizing and cashback cover each balance;
// an abono spreads an amount oldest first; the rest ask before doing it
export function DebtBulkBar({ selected, onDone }: { selected: Debt[]; onDone: () => void }) {
  const bulk = useBulkDebts();
  const period = usePeriod((s) => s);
  const [asking, setAsking] = useState<Asking>(null);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(toIsoDate(new Date()));
  const [target, setTarget] = useState({ month: period.month, year: period.year });
  const [cardId, setCardId] = useState<string | null>(null);

  const ids = selected.map((debt) => debt.id);
  const balance = selected.reduce((sum, debt) => sum + debt.balance, 0);
  const withPayments = selected.filter((debt) => debt.paidAmount > 0).length;
  const run = (body: Omit<DebtBulk, "ids">) =>
    bulk.mutate({ ids, ...body }, { onSuccess: () => (setAsking(null), onDone()) });

  if (!selected.length) return null;

  return (
    <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 rounded-lg border bg-background/95 p-2 shadow-sm backdrop-blur">
      <span className="px-2 text-sm font-medium">
        {selected.length} seleccionadas · saldo {formatCurrency(balance)}
      </span>
      <Button size="sm" onClick={() => run({ action: "pay" })} disabled={bulk.isPending || balance <= 0}>
        <HandCoins className="mr-1 h-4 w-4" /> Pagar
      </Button>
      <Button size="sm" variant="outline" onClick={() => (setAmount(""), setAsking("partial"))} disabled={balance <= 0}>
        <Wallet className="mr-1 h-4 w-4" /> Abonar…
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" aria-label="Más acciones">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem onSelect={() => run({ action: "prepaid" })} disabled={balance <= 0}>
            <Undo2 /> Amortizar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => run({ action: "cashback" })} disabled={balance <= 0}>
            <RotateCcw /> Cashback
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAsking("clone")}>
            <Copy /> Clonar a…
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAsking("card")}>
            <CreditCard /> Asignar tarjeta…
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAsking("reset")} disabled={!withPayments}>
            <Ban /> Volver a No iniciado
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setAsking("delete")}>
            <Trash2 /> Borrar…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button size="sm" variant="ghost" onClick={onDone} aria-label="Quitar selección">
        <X className="h-4 w-4" />
      </Button>

      <ResponsiveDialog
        open={asking === "partial"}
        onOpenChange={(open) => !open && setAsking(null)}
        title="Abonar"
        description={`Se reparte entre las ${selected.length} seleccionadas, primero las más antiguas.`}
        footer={
          <Button
            onClick={() => run({ action: "partial", amount: Number(amount), paidAt })}
            disabled={!(Number(amount) > 0) || bulk.isPending}
          >
            Abonar
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Monto</label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
            <p className="text-xs text-muted-foreground">Saldo: {formatCurrency(balance)}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha</label>
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          </div>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={asking === "clone"}
        onOpenChange={(open) => !open && setAsking(null)}
        title="Clonar a otro mes"
        description="Se crea una copia de cada una, sin abonos, en el mes elegido."
        footer={
          <Button onClick={() => run({ action: "clone", ...target })} disabled={bulk.isPending}>
            Clonar {selected.length}
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 py-2">
          <Select value={String(target.month)} onValueChange={(month) => setTarget({ ...target, month: Number(month) })}>
            <SelectTrigger aria-label="Mes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month} value={String(month)}>
                  {getMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            aria-label="Año"
            value={target.year}
            onChange={(e) => setTarget({ ...target, year: Number(e.target.value) })}
          />
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={asking === "card"}
        onOpenChange={(open) => !open && setAsking(null)}
        title="Asignar tarjeta"
        description="La tarjeta con que se hizo el consumo: Cobros la contrasta con su estado de cuenta."
        footer={
          <Button onClick={() => run({ action: "card", paymentMethodId: cardId })} disabled={bulk.isPending}>
            Asignar
          </Button>
        }
      >
        <div className="py-2">
          <PaymentMethodSelect allowEmpty value={cardId} onChange={setCardId} placeholder="Sin tarjeta" />
        </div>
      </ResponsiveDialog>

      <AlertDialog open={asking === "reset"} onOpenChange={(open) => !open && setAsking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Volver a No iniciado?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borran los abonos de las {withPayments} seleccionadas que tienen alguno; el saldo vuelve al total.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => run({ action: "reset" })}>Volver a No iniciado</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={asking === "delete"} onOpenChange={(open) => !open && setAsking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar {selected.length} cuotas?</AlertDialogTitle>
            <AlertDialogDescription>
              No se puede deshacer.
              {withPayments > 0 &&
                ` ${withPayments} tienen abonos: se dejan salvo que elijas borrarlas también.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {withPayments > 0 && (
              <Button variant="destructive" onClick={() => run({ action: "delete", force: true })}>
                Borrar todas
              </Button>
            )}
            <AlertDialogAction onClick={() => run({ action: "delete" })}>
              {withPayments > 0 ? "Borrar las sin abonos" : "Borrar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
