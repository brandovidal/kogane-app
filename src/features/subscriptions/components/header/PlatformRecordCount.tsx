import { usePlatformHeader } from "../../stores/platform-header.store";

export function PlatformRecordCount() {
  const count = usePlatformHeader((state) => state.count);
  if (count == null) return null;
  return <span className="whitespace-nowrap text-sm font-medium tabular-nums text-muted-foreground" aria-live="polite">{count} {count === 1 ? "activa" : "activas"}</span>;
}
