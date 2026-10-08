import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/ui/card";

export function BudgetKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <Card className="py-3">
      <CardContent className="space-y-1 px-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="text-xl font-bold tabular-nums">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
        {children}
      </CardContent>
    </Card>
  );
}
