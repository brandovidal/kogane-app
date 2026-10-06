import { useFixedCostHeader } from "../../stores/fixed-cost-header.store";

/** "4 registros" next to the page title; empty until the list has loaded. */
export function FixedCostRecordCount() {
  const shown = useFixedCostHeader((state) => state.shown);
  const noun = useFixedCostHeader((state) => state.noun);
  if (shown == null) return null;
  const plural =
    noun === "registro"
      ? "registros"
      : noun === "pendiente"
        ? "pendientes"
        : "deudas";
  return (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums text-muted-foreground" aria-live="polite">
      {shown} {shown === 1 ? noun : plural}
    </span>
  );
}
