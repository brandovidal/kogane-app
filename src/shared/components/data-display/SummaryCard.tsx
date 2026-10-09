import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface SummaryCardProps {
  label: ReactNode;
  value: ReactNode;
  detail: ReactNode;
  className?: string;
  valueClassName?: string;
  detailClassName?: string;
}

export function SummaryCard({
  label,
  value,
  detail,
  className,
  valueClassName,
  detailClassName,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border bg-card px-4 py-3.5",
        className,
      )}
    >
      <div className="eyebrow">{label}</div>
      <div
        className={cn(
          "mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums",
          valueClassName,
        )}
      >
        {value}
      </div>
      <div
        className={cn("mt-1.5 text-xs text-muted-foreground", detailClassName)}
      >
        {detail}
      </div>
    </div>
  );
}
