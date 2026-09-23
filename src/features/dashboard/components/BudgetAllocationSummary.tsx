import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { PieChart } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import { useBudgetGroupSummaries } from "@/features/budget-groups/budget-group.service";

const GROUP_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"];

interface BudgetAllocationSummaryProps {
  month: number;
  year: number;
}

export function BudgetAllocationSummary({ month, year }: BudgetAllocationSummaryProps) {
  const { summaries } = useBudgetGroupSummaries(month, year);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <PieChart className="h-4 w-4" />
          Distribución Presupuesto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {summaries.map((s, idx) => {
          const progress = s.assignedAmount > 0 ? Math.min((s.spentAmount / s.assignedAmount) * 100, 100) : 0;
          const isOver = s.spentAmount > s.assignedAmount;
          const color = GROUP_COLORS[idx % GROUP_COLORS.length];

          return (
            <div key={s.group.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">
                  {s.group.emoji} {s.group.name} ({s.group.percentage}%)
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(s.spentAmount)} / {formatCurrency(s.assignedAmount)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: isOver ? "#EF4444" : color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
