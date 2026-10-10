import { useState } from "react";
import { PeriodStatusNotice } from "@/shared/components/data-display/PeriodStatusNotice";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { useDebtSummaryData } from "../hooks/useDebtSummaryData";
import { usePersonSummaries } from "../hooks/personSummaries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import {
  DEBT_FILTER_KEYS,
  type DebtFilterValues,
} from "@/features/debts/lib/debt-filters";
import {
  ActiveDebtFilterChips,
  DebtFilterSheet,
  DebtReportLinks as ReportLinks,
} from "../sections/DebtListControls";
import { DebtMovementTypeSheet } from "../sections/DebtMovementTypeSheet";
import { StatementMinimumSection } from "../sections/StatementMinimumSection";
import { PersonDebtSummaryCardList } from "../sections/PersonDebtSummaryCardList";
import { DebtSummaryMonthlyTable } from "../sections/DebtSummaryMonthlyTable";
import { CardMinimumCoverageSection } from "../sections/CardMinimumCoverageSection";

export function DebtSummaryView({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const defaults: DebtFilterValues = {
    month: String(month),
    year: String(year),
  };
  const [filters, setFilters] = useUrlFilters<DebtFilterValues>(
    DEBT_FILTER_KEYS,
    defaults,
  );
  const [view, setView] = useViewMode("debt-summary", "cards");
  const [summaryView, setSummaryView] = useState("consolidated");
  const [showCollections, setShowCollections] = useState(true);
  const [showDebts, setShowDebts] = useState(true);
  const summary = useDebtSummaryData({
    month,
    year,
    filters,
    summaryView,
    showCollections,
    showDebts,
  });
  const personSummaries = usePersonSummaries(
    summary.selectedMonth,
    summary.selectedYear,
  );
  const summariesByPerson = new Map(
    (personSummaries.data ?? []).map((item) => [item.personId, item]),
  );
  const periodMonth =
    filters.month && filters.month !== "until" ? Number(filters.month) : null;
  const periodYear = Number(filters.year ?? year);
  if (summary.isLoading) return null;
  const {
    paymentMethods,
    cardNames,
    cardDueDates,
    open,
    shown,
    reportFilter,
    totalToCollect,
    selectedMonth,
    selectedYear,
    creditCards,
    statementChecks,
    minimumCoverage,
    statementChargeAdjustments,
    personalExpenses,
    groups,
    visibleGroups,
    byMonth,
    totalToPay,
    netTotal,
  } = summary;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <DebtFilterSheet
          value={filters}
          onChange={setFilters}
          debts={open}
          cards={paymentMethods}
          monthLabel={`${getMonthName(month)} ${year}`}
          shown={shown.length}
          year={year}
          defaults={defaults}
          description="Filtra el resumen por persona, estado, período, tarjeta u origen."
          resultLabel="cobros"
          hideDirection
        />
        <DebtMovementTypeSheet
          showCollections={showCollections}
          showDebts={showDebts}
          onCollectionsChange={setShowCollections}
          onDebtsChange={setShowDebts}
          onReset={() => {
            setShowCollections(true);
            setShowDebts(true);
          }}
        />
        <ReportLinks filter={reportFilter} />
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ActiveDebtFilterChips
          value={filters}
          onChange={setFilters}
          debts={open}
          cards={paymentMethods}
          monthLabel={`${getMonthName(month)} ${year}`}
          defaults={defaults}
          directionFilterEnabled={false}
          grouping={{
            byPerson: false,
            byCard: false,
            onToggle: () => {},
            movement: {
              showCollections,
              showDebts,
              onReset: () => {
                setShowCollections(true);
                setShowDebts(true);
              },
            },
          }}
        />
        <div className="flex justify-end">
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>
      {periodMonth && (
        <PeriodStatusNotice
          month={periodMonth}
          year={periodYear}
          billedHint="revisa lo que falta por cobrar y registra los pagos"
          currentHint="es un borrador: se recalcula con cada movimiento nuevo."
        />
      )}
      {showDebts && (
        <div className="flex min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-sm">
          {showCollections && (
            <span>
              <span className="text-muted-foreground">Cobros</span>{" "}
              <strong className="font-semibold tabular-nums text-amber-300">
                {formatCurrency(totalToCollect)}
              </strong>
            </span>
          )}
          <span>
            <span className="text-muted-foreground">Lo que debo</span>{" "}
            <strong className="font-medium tabular-nums text-muted-foreground">
              {formatCurrency(totalToPay)}
            </strong>
          </span>
          <span className="font-semibold text-primary">
            {netTotal > 0 ? "Por cobrar" : netTotal < 0 ? "Por pagar" : "Saldo"}{" "}
            {formatCurrency(Math.abs(netTotal))}
          </span>
        </div>
      )}
      {(!groups.length && !creditCards.length) ||
      (!showCollections && !showDebts) ? (
        !showCollections && !showDebts ? (
          <EmptyState
            variant="filters"
            title="Nada que mostrar"
            description="Activa Cobros (+), Deudas (−) o ambos en los filtros."
          />
        ) : (
          <EmptyState
            variant="period"
            title="Sin movimientos este mes"
            description="Cuando registres cobros, deudas o tarjetas compartidas, el resumen de cada persona se arma solo."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild size="sm">
                  <a href="/cobros">Ir a Cobros</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/deudas">Ir a Deudas</a>
                </Button>
              </div>
            }
          />
        )
      ) : (
        <Tabs
          value={summaryView}
          onValueChange={setSummaryView}
          className="w-full"
        >
          <TabsList className="w-full justify-start sm:w-auto">
            <TabsTrigger value="consolidated">Consolidado</TabsTrigger>
            <TabsTrigger
              value="minimum"
              className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            >
              Tarjeta (pago mínimo)
            </TabsTrigger>
          </TabsList>
          <TabsContent value={summaryView} className="mt-4 space-y-3">
            {summaryView === "minimum" ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Estados de cuenta y pagos mínimos de tus tarjetas.
                </p>
                {!showCollections ? (
                  <Card>
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      El filtro está mostrando solo deudas. El pago mínimo
                      corresponde a cobros del estado de cuenta; selecciona
                      Cobros (+) para verlo.
                    </CardContent>
                  </Card>
                ) : (
                  <StatementMinimumSection
                    cards={creditCards.filter((_, index) =>
                      Boolean(statementChecks[index]?.data?.statementId),
                    )}
                    isLoading={statementChecks.some((check) => check.isLoading)}
                    hasCreditCards={creditCards.length > 0}
                    month={selectedMonth}
                    year={selectedYear}
                  />
                )}
              </div>
            ) : (
              <>
                {view === "cards" ? (
                  <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
                    <PersonDebtSummaryCardList
                      groups={visibleGroups}
                      statementAdjustments={statementChargeAdjustments}
                      personalExpenses={personalExpenses}
                      cardNames={cardNames}
                      cardDueDates={cardDueDates}
                      reportFilter={reportFilter}
                      showCollections={showCollections}
                      showDebts={showDebts}
                      month={selectedMonth}
                      year={selectedYear}
                      summaries={summariesByPerson}
                    />
                  </div>
                ) : (
                  <DebtSummaryMonthlyTable
                    rows={byMonth}
                    recordCount={
                      shown.length +
                      (summaryView === "consolidated"
                        ? personalExpenses.length
                        : 0)
                    }
                    totalToCollect={totalToCollect}
                    totalToPay={totalToPay}
                    netTotal={netTotal}
                  />
                )}
                {showCollections && (
                  <CardMinimumCoverageSection
                    items={minimumCoverage}
                    month={selectedMonth}
                    year={selectedYear}
                  />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
