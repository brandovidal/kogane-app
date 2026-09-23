import { withQuery } from "@/shared/api/query";
import { usePeriod } from "@/shared/stores/period.store";
import { MonthlySummary } from "./MonthlySummary";
import { ExpenseChart } from "./ExpenseChart";
import { CategoryRing } from "./CategoryRing";
import { BillingCycleCard } from "./BillingCycleCard";
import { BudgetAllocationSummary } from "./BudgetAllocationSummary";
import { useDashboard } from "../dashboard.service";

function DashboardPageView() {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const { summary, categories, creditCards, trend } = useDashboard(selectedMonth, selectedYear);

  return (
    <div className="space-y-4">
      <MonthlySummary summary={summary} />

      <div className="grid gap-4 md:grid-cols-2">
        <ExpenseChart data={trend} />
        <CategoryRing data={categories} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BudgetAllocationSummary month={selectedMonth} year={selectedYear} />
        <BillingCycleCard cards={creditCards} />
      </div>
    </div>
  );
}

export const DashboardPage = withQuery(DashboardPageView);
