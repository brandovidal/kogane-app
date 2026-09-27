import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface RecordListToolbarProps {
  primary?: ReactNode;
  primaryClassName?: string;
  actions: ReactNode;
  applied?: ReactNode;
  view?: ReactNode;
}

export function RecordListToolbar({
  primary,
  primaryClassName,
  actions,
  applied,
  view,
}: RecordListToolbarProps) {
  return (
    <div className="min-w-0 space-y-2">
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          primaryClassName && "sm:flex-wrap",
        )}
      >
        {primary && (
          <div className={cn("min-w-0 flex-1", primaryClassName)}>
            {primary}
          </div>
        )}
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
          {actions}
        </div>
      </div>
      {(applied || view) && (
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="min-w-0 flex-1">{applied}</div>
          <div className="flex shrink-0 justify-end">{view}</div>
        </div>
      )}
    </div>
  );
}
