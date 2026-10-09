import { BudgetDonut } from "@/features/budget/components/BudgetDonut";
import { BudgetKpis } from "@/features/budget/components/BudgetKpis";
import { BudgetVsActual } from "@/features/budget/components/BudgetVsActual";
import { SurplusTrend } from "@/features/budget/components/SurplusTrend";
import { useSummary } from "@/features/budget/hooks/summary";
import { withQuery } from "@/shared/api/query";
import { useState } from "react";
import { usePeriod } from "@/shared/stores/period.store";

import { useCreditCardSummaries } from "@/features/dashboard/hooks/useCreditCardSummaries";
import { BillingCycleCard } from "./BillingCycleCard";
import { DashboardPeriodNotice } from "./DashboardPeriodNotice";
import { DashboardOverview } from "./DashboardOverview";
import { DashboardPaymentDialog } from "./DashboardPaymentDialog";

function DashboardPageView() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentTab, setPaymentTab] = useState<
    "card" | "fixed" | "collect" | "debt"
  >("card");
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const summary = useSummary(month, year).data;
  const creditCards = useCreditCardSummaries(month, year);

  return (
    <div className="space-y-4">
      <DashboardPeriodNotice />
      <BudgetKpis summary={summary} month={month} year={year} />
      <DashboardOverview
        summary={summary}
        month={month}
        year={year}
        onRegisterPayment={(tab) => {
          setPaymentTab(tab);
          setPaymentDialogOpen(true);
        }}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetDonut summary={summary} month={month} year={year} />
        <SurplusTrend month={month} year={year} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetVsActual summary={summary} compact />
        <BillingCycleCard cards={creditCards} />
      </div>
      <DashboardPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        initialTab={paymentTab}
      />
    </div>
  );
}

export const DashboardPage = withQuery(DashboardPageView);
