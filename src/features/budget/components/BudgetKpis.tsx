import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useSetBudget } from "@/features/budget/hooks/summary";
import type { Summary } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { BudgetKpiCard } from "./BudgetKpiCard";

import { incomeOf, limitUsage } from "@/features/budget/lib/budget-view";

interface BudgetKpisProps {
  summary: Summary | undefined;
  month: number;
  year: number;
}

export function BudgetKpis({ summary, month, year }: BudgetKpisProps) {
  const setBudget = useSetBudget();
  const income = incomeOf(summary);
  const usage = limitUsage(summary);
  const surplus = summary?.surplus ?? null;
  const isProposal = summary?.budget?.isProposal ?? false;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <BudgetKpiCard
        label="Ingresos"
        value={formatCurrency(income.total)}
        icon={Wallet}
        hint={
          income.extra
            ? `Sueldo ${formatCurrency(income.salary)} + extras ${formatCurrency(income.extra)}`
            : "Sueldo del mes"
        }
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
                setBudget.mutate({
                  month,
                  year,
                  salary: summary.budget!.salary,
                  limitPercent: summary.budget!.limitPercent,
                })
              }
            >
              Confirmar sueldo
            </Button>
          </div>
        )}
      </BudgetKpiCard>
      <BudgetKpiCard
        label="Gastado (tu parte)"
        value={formatCurrency(summary?.spentPen ?? 0)}
        icon={TrendingDown}
        hint="Día a día + costos fijos + tarjetas"
      />
      <BudgetKpiCard
        label="Excedente"
        value={surplus == null ? "—" : formatCurrency(surplus)}
        icon={TrendingUp}
        hint={
          surplus == null
            ? "Registra el sueldo del mes"
            : surplus < 0
              ? "Gastaste más de lo que ingresó"
              : "Ingresos − gastos"
        }
      />
      <BudgetKpiCard
        label="Límite"
        value={summary?.budget ? formatCurrency(summary.budget.limit) : "—"}
        icon={usage != null && usage >= 100 ? AlertTriangle : CheckCircle2}
        hint={usage == null ? "Sin sueldo registrado" : `${usage} % usado`}
      />
    </div>
  );
}
