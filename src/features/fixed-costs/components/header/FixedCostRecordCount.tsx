import { useFixedCostHeader } from "../../stores/fixed-cost-header.store";

/** "4 registros" next to the page title; empty until the list has loaded. */
export function FixedCostRecordCount() {
  const shown = useFixedCostHeader((state) => state.shown);
  if (shown == null) return null;
  return (
    <span className="whitespace-nowrap text-sm font-medium tabular-nums text-muted-foreground" aria-live="polite">
      {shown} {shown === 1 ? "registro" : "registros"}
    </span>
  );
}
