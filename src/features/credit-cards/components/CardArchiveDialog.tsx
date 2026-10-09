import { Archive, LoaderCircle } from "lucide-react";
import { useDeactivatePaymentMethod } from "@/shared/api/hooks/catalogs";
import type { PaymentMethod } from "@/shared/api/types";
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
import { archiveSummary } from "../lib/card-archive";

/** Archiving deactivates the card: it leaves the lists, its movements stay. */
export function CardArchiveDialog({
  card,
  movements,
  pending,
  onClose,
}: {
  card: PaymentMethod;
  movements: number;
  pending: number;
  onClose: () => void;
}) {
  const deactivate = useDeactivatePaymentMethod();
  return (
    <AlertDialog
      open
      onOpenChange={(open) => !open && !deactivate.isPending && onClose()}
    >
      <AlertDialogContent
        className="sm:max-w-md"
        aria-busy={deactivate.isPending}
      >
        <AlertDialogHeader>
          <span className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Archive aria-hidden="true" className="size-5" />
          </span>
          <AlertDialogTitle className="break-words">
            ¿Archivar la tarjeta {card.name}?
          </AlertDialogTitle>
          <AlertDialogDescription className="break-words">
            {archiveSummary(movements, pending)} Dejará de aparecer en las
            listas y en el registro de gastos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" disabled={deactivate.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={deactivate.isPending}
            onClick={(event) => {
              event.preventDefault();
              deactivate.mutate(card.id, { onSuccess: onClose });
            }}
          >
            {deactivate.isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <Archive aria-hidden="true" className="size-4" />
            )}
            Archivar tarjeta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
