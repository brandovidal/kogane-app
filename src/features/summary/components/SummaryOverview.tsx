import { BudgetDonut } from "@/features/budget/components/BudgetDonut";
import { BudgetGroupsCard } from "@/features/budget/components/BudgetGroupsCard";
import { BudgetKpis } from "@/features/budget/components/BudgetKpis";
import { BudgetVsActual } from "@/features/budget/components/BudgetVsActual";
import { SurplusTrend } from "@/features/budget/components/SurplusTrend";
import { useSummary } from "@/shared/api/hooks/summary";
import { withQuery } from "@/shared/api/query";
import { usePeriod } from "@/shared/stores/period.store";

// Resumen mensual (D78): your budget in full, like the Resumen of Notion (surplus = salary + extras − spent, D65)
function SummaryOverviewView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const summary = useSummary(month, year).data;

  return (
    <div className="space-y-4">
      <BudgetKpis summary={summary} month={month} year={year} />
      <BudgetDonut summary={summary} month={month} year={year} />
      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetVsActual summary={summary} />
        <BudgetGroupsCard summary={summary} />
      </div>
      <SurplusTrend month={month} year={year} />
    </div>
  );
}

export const SummaryOverview = withQuery(SummaryOverviewView);
