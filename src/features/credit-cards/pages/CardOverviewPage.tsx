import { useState } from "react";
import { withQuery } from "@/shared/api/query";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { CardPeriodSelector } from "../components/header/CardPeriodSelector";
import { CardEditorDialog } from "../components/CardEditorDialog";
import { useCardOverview } from "../hooks/useCardOverview";
import { CardOverviewViewBar, type CardOverviewView } from "../sections/overview/CardOverviewViewBar";
import { CardOverviewMetrics } from "../sections/overview/CardOverviewMetrics";
import { CardOverviewToolbar } from "../sections/overview/CardOverviewToolbar";
import { CardOverviewResults } from "../sections/overview/CardOverviewResults";
import { CardOverviewMovements } from "../sections/overview/CardOverviewMovements";

function CardOverviewPageContent() {
  const data = useCardOverview();
  const [view, setView] = useState<CardOverviewView>("summary");
  const [layout, setLayout] = useState<"cards" | "table">("cards");
  const [creatingCard, setCreatingCard] = useState(false);
  const openNewExpense = useNewExpense((state) => state.openWith);
  return <div className="space-y-4">
    <div className="flex justify-end sm:hidden"><CardPeriodSelector /></div>
    <CardOverviewViewBar view={view} onViewChange={setView} onNewExpense={() => openNewExpense({ destination: "credit_card" })} onNewCard={() => setCreatingCard(true)} />
    <CardOverviewMetrics rows={data.rows} movements={data.filtered.length} total={data.total} loading={data.loading} />
    <CardOverviewToolbar filters={data.filters} onFiltersChange={data.setFilters} layout={layout} onLayoutChange={setLayout} />
    {view === "summary" ? <CardOverviewResults rows={data.rows} layout={layout} loading={data.loading} error={data.error} /> : <CardOverviewMovements expenses={data.filtered} cards={data.cards} personName={data.personName} installmentsOnly={view === "installments"} />}
    {creatingCard && <CardEditorDialog onClose={() => setCreatingCard(false)} />}
  </div>;
}

export const CardOverviewPage = withQuery(CardOverviewPageContent);
