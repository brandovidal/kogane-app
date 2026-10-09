import { cn } from "@/shared/utils/cn";

export type IndicatorTone = "neutral" | "pending" | "done" | "danger";

/** Color de estado del valor: pendiente = ámbar, completado = verde, vencido = rojo. */
export const INDICATOR_TONE_CLASS: Record<IndicatorTone, string> = {
  neutral: "text-foreground",
  pending: "text-amber-600 dark:text-amber-300",
  done: "text-emerald-600 dark:text-emerald-300",
  danger: "text-red-600 dark:text-red-400",
};

export interface IndicatorsCollapsedSummaryProps {
  summary: string;
  metrics: Array<{
    label: string;
    value: string;
    tone?: IndicatorTone;
    valueClass?: string;
  }>;
}

export function IndicatorsCollapsedSummary({
  summary,
  metrics,
}: IndicatorsCollapsedSummaryProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center">
      <div className="hidden min-w-0 flex-1 items-center gap-x-4 overflow-hidden text-xs lg:flex">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={cn(
              "flex min-w-0 shrink-0 items-center gap-1.5",
              index > 0 && "border-l border-border/70 pl-4",
            )}
          >
            <span className="truncate text-muted-foreground">
              {metric.label}
            </span>
            <span
              className={cn(
                "truncate font-semibold tabular-nums",
                INDICATOR_TONE_CLASS[metric.tone ?? "neutral"],
                metric.valueClass,
              )}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>
      <span className="min-w-0 flex-1 truncate text-sm tabular-nums text-muted-foreground lg:hidden">
        {summary}
      </span>
    </div>
  );
}
