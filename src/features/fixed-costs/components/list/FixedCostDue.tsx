import { useEffect, useState } from "react";
import type { FixedCost } from "@/shared/api/types";
import { formatDate } from "@/shared/lib/dates";
import { cn } from "@/shared/utils/cn";
import { daysUntilDue, isCompletedFixedCost } from "../../lib/fixed-cost-summary";
import { localTodayKey, relativeDueLabel } from "../../lib/fixed-cost-views";

/** Due date with "en 3 días" / "venció hace 2 días" under it while the cost is still pending. */
export function FixedCostDue({ cost }: { cost: FixedCost }) {
  const [todayKey, setTodayKey] = useState("");
  useEffect(() => setTodayKey(localTodayKey()), []);
  if (!cost.dueDate) return <span className="text-sm text-muted-foreground">—</span>;
  const pending = !isCompletedFixedCost(cost);
  const days = pending && todayKey ? daysUntilDue(cost.dueDate, todayKey) : null;
  const relative = relativeDueLabel(days);
  return (
    <div className="flex flex-col leading-tight">
      <span className={cn("text-sm tabular-nums", pending ? "text-foreground" : "text-muted-foreground")}>
        {formatDate(cost.dueDate)}
      </span>
      {relative && days != null && days <= 30 && (
        <span className={cn("text-xs", days < 0 ? "text-destructive" : "text-amber-600 dark:text-amber-300")}>
          {relative}
        </span>
      )}
    </div>
  );
}
