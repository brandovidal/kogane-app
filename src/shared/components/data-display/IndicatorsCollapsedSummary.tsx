import { cn } from "@/shared/utils/cn";

export interface IndicatorsCollapsedSummaryProps {
  summary: string;
  metrics: Array<{ label: string; value: string; valueClass?: string }>;
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
                "truncate font-semibold text-foreground tabular-nums",
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
