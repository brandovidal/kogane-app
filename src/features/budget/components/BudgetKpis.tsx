import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { useSetBudget } from "@/shared/api/hooks/summary";
import type { Summary } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";

import { incomeOf, limitUsage } from "../budget-view";

interface BudgetKpisProps {
  summary: Summary | undefined;
  month: number;
  year: number;
}

function Kpi({ label, value, hint, icon: Icon, children }: { label: string; value: string; hint?: React.ReactNode; icon: typeof Wallet; children?: React.ReactNode }) {
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

// Ingresos · Gastado · Excedente · Límite of the month (D78); a proposed salary can be confirmed from here
export function BudgetKpis({ summary, month, year }: BudgetKpisProps) {
  const setBudget = useSetBudget();
  const income = incomeOf(summary);
  const usage = limitUsage(summary);
  const surplus = summary?.surplus ?? null;
  const isProposal = summary?.budget?.isProposal ?? false;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi
        label="Ingresos"
        value={formatCurrency(income.total)}
        icon={Wallet}
        hint={income.extra ? `Sueldo ${formatCurrency(income.salary)} + extras ${formatCurrency(income.extra)}` : "Sueldo del mes"}
      >
        {isProposal && summary?.budget && (
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline">propuesto</Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={setBudget.isPending}
              onClick={() =>
                setBudget.mutate({ month, year, salary: summary.budget!.salary, limitPercent: summary.budget!.limitPercent })
              }
            >
              Confirmar sueldo
            </Button>
          </div>
        )}
      </Kpi>
      <Kpi label="Gastado (tu parte)" value={formatCurrency(summary?.spentPen ?? 0)} icon={TrendingDown} hint="Día a día + costos fijos + tarjetas" />
      <Kpi
        label="Excedente"
        value={surplus == null ? "—" : formatCurrency(surplus)}
        icon={TrendingUp}
        hint={surplus == null ? "Registra el sueldo del mes" : surplus < 0 ? "Gastaste más de lo que ingresó" : "Ingresos − gastos"}
      />
      <Kpi
        label="Límite"
        value={summary?.budget ? formatCurrency(summary.budget.limit) : "—"}
        icon={usage != null && usage >= 100 ? AlertTriangle : CheckCircle2}
        hint={usage == null ? "Sin sueldo registrado" : `${usage} % usado`}
      />
    </div>
  );
}
