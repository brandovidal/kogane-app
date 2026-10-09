import { pluralize } from "@/features/dashboard/lib/pending-groups";

/** Body of the archive confirmation: what happens to the card's movements. */
export function archiveSummary(movements: number, pending: number): string {
  const moves =
    movements === 0
      ? "No tiene movimientos."
      : `Tiene ${pluralize(movements, "movimiento", "movimientos")}; se conservan y siguen asignados a la tarjeta.`;
  return pending > 0
    ? `${moves} Hay ${pluralize(pending, "pago pendiente", "pagos pendientes")} sin registrar.`
    : moves;
}
