import { useEffect, useState } from "react";
import type { Summary } from "@/shared/api/types";
import { usePeriod } from "@/shared/stores/period.store";
import { PendingCard } from "../components/PendingCard";
import { useDashboardPendingEntries } from "../hooks/useDashboardPendingEntries";
import type { DashboardPaymentTab } from "../types/dashboard";

export function DashboardPendingSection({
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
  const [onlySelectedMonth, setOnlySelectedMonth] = useState(true);
  const { entries, today } = useDashboardPendingEntries(summary, month, year, onlySelectedMonth);
  const setPeriod = usePeriod((state) => state.setPeriod);
  const [isBilled, setIsBilled] = useState(false);

  useEffect(() => {
    const now = new Date();
    setIsBilled(year * 12 + month < now.getFullYear() * 12 + now.getMonth() + 1);
  }, [month, year]);

  if (!today) return null;
  return (
    <PendingCard
      entries={entries}
      today={today}
      month={month}
      year={year}
      isBilled={isBilled}
      onlySelectedMonth={onlySelectedMonth}
      onOnlySelectedMonthChange={setOnlySelectedMonth}
      onGoToPreviousMonth={() => setPeriod(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year)}
      onRegisterPayment={onRegisterPayment}
    />
  );
}
