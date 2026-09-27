import { LoaderCircle } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/ui/marker";

export function HistoryTimelineLoading() {
  return (
    <div className="space-y-4 py-2">
      <Marker role="status" aria-live="polite">
        <MarkerIcon><LoaderCircle className="motion-safe:animate-spin" /></MarkerIcon>
        <MarkerContent className="shimmer">Cargando el historial…</MarkerContent>
      </Marker>
      <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
        {[0, 1].map((index) => (
          <div key={index} className="ml-10 space-y-4 rounded-lg border p-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 rounded bg-muted/60" />
              <div className="h-10 rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
