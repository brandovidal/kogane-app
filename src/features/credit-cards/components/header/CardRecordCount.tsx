import { useCardHeader } from "../../stores/card-header.store";

export function CardRecordCount() {
  const count = useCardHeader((state) => state.count);
  if (count == null) return null;
  return <span className="whitespace-nowrap text-sm font-medium tabular-nums text-muted-foreground" aria-live="polite">{count} {count === 1 ? "tarjeta" : "tarjetas"}</span>;
}
