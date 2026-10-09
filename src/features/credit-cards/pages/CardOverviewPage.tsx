import { useState } from "react";
import { withQuery } from "@/shared/api/query";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { CardPeriodSelector } from "../components/header/CardPeriodSelector";
import { CardEditorDialog } from "../components/CardEditorDialog";
import { CardArchiveDialog } from "../components/CardArchiveDialog";
import type { CardOverviewRow } from "../types/card-overview";
import { useCardOverview } from "../hooks/useCardOverview";
import {
  CardOverviewViewBar,
  type CardOverviewView,
} from "../sections/overview/CardOverviewViewBar";
import { CardOverviewMetrics } from "../sections/overview/CardOverviewMetrics";
import { CardOverviewToolbar } from "../sections/overview/CardOverviewToolbar";
import { CardOverviewResults } from "../sections/overview/CardOverviewResults";
import { CardOverviewMovements } from "../sections/overview/CardOverviewMovements";
import { CardOverviewPeriodView } from "../sections/overview/CardOverviewPeriodView";
import type { CardOverviewGroupBy } from "../constants/filters";

function CardOverviewPageContent() {
  const data = useCardOverview();
  const [view, setView] = useState<CardOverviewView>("summary");
  const [layout, setLayout] = useState<"cards" | "table">("cards");
  const [groupBy, setGroupBy] = useState<CardOverviewGroupBy[]>([]);
  const [creatingCard, setCreatingCard] = useState(false);
  const [editing, setEditing] = useState<CardOverviewRow | null>(null);
  const [archiving, setArchiving] = useState<CardOverviewRow | null>(null);
  const openNewExpense = useNewExpense((state) => state.openWith);
  return (
    <div className="space-y-4">
      <div className="flex justify-end sm:hidden">
        <CardPeriodSelector />
      </div>
      <CardOverviewViewBar
        view={view}
        onViewChange={setView}
        onNewExpense={() => openNewExpense({ destination: "credit_card" })}
        onNewCard={() => setCreatingCard(true)}
      />
      <CardOverviewMetrics
        rows={data.rows}
        movements={data.filtered.length}
        total={data.total}
        loading={data.loading}
        month={data.month}
        view={view}
        expenses={data.filtered}
      />
      <CardOverviewToolbar
        filters={data.filters}
        onFiltersChange={data.setFilters}
        layout={layout}
        onLayoutChange={setLayout}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        paymentMethodRecords={data.filtered}
      />
      {view === "summary" ? (
        <CardOverviewResults
          rows={data.rows}
          layout={layout}
          groupBy={groupBy}
          personName={data.personName}
          loading={data.loading}
          error={data.error}
          actions={{
            onNewExpense: (row) =>
              openNewExpense({
                destination: "credit_card",
                paymentMethodId: row.card.id,
              }),
            onEdit: setEditing,
            onArchive: setArchiving,
          }}
        />
      ) : view === "currency" ? (
        <CardOverviewMovements
          expenses={data.filtered}
          cards={data.cards}
          personName={data.personName}
          groupBy={groupBy}
          layout={layout}
          currencyView
        />
      ) : view === "period" ? (
        <CardOverviewPeriodView
          rows={data.rows}
          onNewCard={() => setCreatingCard(true)}
          loading={data.loading}
          error={data.error}
        />
      ) : (
        <CardOverviewMovements
          expenses={data.filtered}
          cards={data.cards}
          personName={data.personName}
          groupBy={groupBy}
          layout={layout}
          installmentsOnly={view === "installments"}
        />
      )}
      {creatingCard && (
        <CardEditorDialog onClose={() => setCreatingCard(false)} />
      )}
      {editing && (
        <CardEditorDialog
          card={editing.card}
          movements={editing.count}
          onArchive={() => {
            setArchiving(editing);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {archiving && (
        <CardArchiveDialog
          card={archiving.card}
          movements={archiving.count}
          pending={
            archiving.pending > 0
              ? archiving.expenses.filter((e) => e.paymentStatus !== "paid")
                  .length
              : 0
          }
          onClose={() => setArchiving(null)}
        />
      )}
    </div>
  );
}

export const CardOverviewPage = withQuery(CardOverviewPageContent);
