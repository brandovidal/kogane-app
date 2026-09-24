import { BudgetDonut } from "@/features/budget/components/BudgetDonut";
import { BudgetKpis } from "@/features/budget/components/BudgetKpis";
import { BudgetVsActual } from "@/features/budget/components/BudgetVsActual";
import { SurplusTrend } from "@/features/budget/components/SurplusTrend";
import { useSummary } from "@/shared/api/hooks/summary";
import { withQuery } from "@/shared/api/query";
import { usePeriod } from "@/shared/stores/period.store";

import { useCreditCardSummaries } from "../dashboard.service";
import { BillingCycleCard } from "./BillingCycleCard";

// Inicio (D78): your budget of the month and the cards; the same pieces as the Resumen, without the detail
function DashboardPageView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const summary = useSummary(month, year).data;
  const creditCards = useCreditCardSummaries(month, year);

  return (
    <div className="space-y-4">
      <BudgetKpis summary={summary} month={month} year={year} />
      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetDonut summary={summary} month={month} year={year} />
        <SurplusTrend month={month} year={year} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetVsActual summary={summary} compact />
        <BillingCycleCard cards={creditCards} />
      </div>
    </div>
  );
}

export const DashboardPage = withQuery(DashboardPageView);
