import type { ReactNode } from "react";

export function RecordListToolbar({
  primary,
  actions,
  applied,
  view,
}: {
  primary?: ReactNode;
  actions: ReactNode;
  applied?: ReactNode;
  view?: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {primary && <div className="min-w-0 flex-1">{primary}</div>}
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
