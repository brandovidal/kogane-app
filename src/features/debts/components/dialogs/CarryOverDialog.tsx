import { LoaderCircle, MoveRight } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Button } from "@/ui/button";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { useCarryOverDebts, useCarryOverPreview } from "../../hooks/debts";

/** "Arrastrar saldos pendientes": moves the open installments of earlier months to the current month. */
export function CarryOverDialog({
  open,
  onOpenChange,
  direction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: "owed_to_me" | "i_owe";
}) {
  const today = new Date();
  const target = { month: today.getMonth() + 1, year: today.getFullYear() };
  const query = { ...target, direction };
  const preview = useCarryOverPreview(query, open);
  const carry = useCarryOverDebts();
  const noun = direction === "owed_to_me" ? "cobros" : "deudas";
  const affected = preview.data?.affected ?? 0;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !carry.isPending && onOpenChange(next)}
    >
      <AlertDialogContent className="sm:max-w-md" aria-busy={carry.isPending}>
        <AlertDialogHeader>
          <AlertDialogTitle>Arrastrar saldos pendientes</AlertDialogTitle>
          <AlertDialogDescription>
            {preview.isLoading
              ? "Buscando saldos pendientes…"
              : preview.isError
                ? "No se pudo calcular qué se arrastraría. Inténtalo de nuevo."
                : affected === 0
                  ? `No hay ${noun} pendientes de meses anteriores.`
                  : `${affected} ${affected === 1 ? "cuota pendiente" : "cuotas pendientes"} de meses anteriores (${formatCurrency(preview.data?.balance ?? 0)}) pasarán a ${getMonthName(target.month)} ${target.year}. Los pagos ya registrados se conservan.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={carry.isPending}>
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={carry.isPending || preview.isLoading || affected === 0}
            onClick={() =>
              carry.mutate(query, { onSuccess: () => onOpenChange(false) })
            }
          >
            {carry.isPending ? (
              <LoaderCircle className="mr-1 size-4 animate-spin" />
            ) : (
              <MoveRight className="mr-1 size-4" />
            )}
            Arrastrar al mes en curso
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
