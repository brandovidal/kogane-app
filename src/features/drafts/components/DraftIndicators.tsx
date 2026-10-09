import { formatCurrency } from "@/shared/lib/currency";
import type { DraftSummary } from "@/features/drafts/lib/draft-view";

// Indicadores de Por revisar (board B1): incompletos en ámbar, listos en verde con su avance
export function DraftIndicators({
  summary,
  currency = "PEN",
}: {
  summary: DraftSummary;
  currency?: string;
}) {
  return (
    <section
      aria-label="Indicadores de Borrador"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card/40 px-4 py-2.5 text-xs"
    >
      <b className="text-sm">Indicadores</b>
      <span className="text-muted-foreground">
        Por revisar <b className="ml-1 text-foreground">{summary.total}</b>
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-amber-700 dark:text-amber-300">
        <i className="size-1.5 rounded-full bg-current" />
        Incompletos <b>{summary.incomplete}</b>
        <span className="opacity-80">falta info</span>
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300">
        <i className="size-1.5 rounded-full bg-current" />
        Listos <b>{summary.ready}</b>
        <span
          role="progressbar"
          aria-valuenow={summary.readyPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1 w-10 overflow-hidden rounded-full bg-current/20"
        >
          <i
            className="block h-full bg-current"
            style={{ width: `${summary.readyPercent}%` }}
          />
        </span>
        <b>{summary.readyPercent}%</b>
      </span>
      <span className="text-muted-foreground">
        Monto total{" "}
        <b className="ml-1 text-foreground tabular-nums">
          {formatCurrency(summary.totalAmount, currency)}
        </b>
        {summary.withoutAmount > 0 && (
          <span className="ml-1">+ {summary.withoutAmount} sin monto</span>
        )}
      </span>
    </section>
  );
}
