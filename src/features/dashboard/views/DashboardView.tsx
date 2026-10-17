import { BudgetDonut } from "@/features/budget/components/BudgetDonut";
import { BudgetKpis } from "@/features/budget/components/BudgetKpis";
import { BudgetVsActual } from "@/features/budget/components/BudgetVsActual";
import { SurplusTrend } from "@/features/budget/components/SurplusTrend";
import { useCreditCardSummaries } from "../hooks/useCreditCardSummaries";
import { BillingCycleCard } from "../components/BillingCycleCard";
import { DashboardNextMonthCard } from "../components/DashboardNextMonthCard";
import { DashboardPeriodNotice } from "../components/DashboardPeriodNotice";
import { DashboardQuickActions } from "../components/DashboardQuickActions";
import { DashboardPendingSection } from "../sections/DashboardPendingSection";
import type { DashboardPaymentTab } from "../types/dashboard";
import type { Summary } from "@/shared/api/types";

export function DashboardView({
  summary,
  month,
  year,
  onRegisterPayment,
}: {
  summary: Summary | undefined;
  month: number;
  year: number;
  onRegisterPayment: (tab: DashboardPaymentTab) => void;
}) {
  const creditCards = useCreditCardSummaries(month, year);

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-4">
      <DashboardPeriodNotice />
      <BudgetKpis summary={summary} month={month} year={year} />

      <section aria-label="Presupuesto y próximos compromisos" className="grid auto-rows-fr items-stretch gap-4 xl:grid-cols-3">
        <BudgetVsActual summary={summary} compact />
        <DashboardNextMonthCard month={month} year={year} />
        <BillingCycleCard cards={creditCards} onRegisterPayment={() => onRegisterPayment("card")} />
      </section>

      <DashboardPendingSection summary={summary} month={month} year={year} onRegisterPayment={onRegisterPayment} />

      <section aria-label="Análisis del mes" className="grid gap-4 xl:grid-cols-2">
        <BudgetDonut summary={summary} month={month} year={year} />
        <SurplusTrend month={month} year={year} />
      </section>

      <DashboardQuickActions onRegisterPayment={onRegisterPayment} />
    </div>
  );
}
