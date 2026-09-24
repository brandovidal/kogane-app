import type { Summary } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

// Relación de gastos: each group against its share of the salary (Notion), your part only (D71)
export function BudgetGroupsCard({ summary }: { summary: Summary | undefined }) {
  const groups = summary?.budgetGroups ?? [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Por grupo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {groups.map((group, index) => {
          const percent = group.percent ?? 0;
          const over = percent > 100;
          return (
            <div key={group.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {group.emoji} {group.name} <span className="text-muted-foreground">({group.percentage} %)</span>
                </span>
                <span className={`tabular-nums ${over ? "text-destructive" : "text-muted-foreground"}`}>
                  {formatCurrency(group.spent)} / {group.amount == null ? "—" : formatCurrency(group.amount)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${over ? "bg-destructive" : ""}`}
                  style={{ width: `${Math.min(percent, 100)}%`, ...(over ? {} : { backgroundColor: `var(--chart-${(index % 5) + 1})` }) }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
