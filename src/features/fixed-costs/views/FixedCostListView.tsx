import { withQuery } from "@/shared/api/query";

import { useFixedCostActions } from "../hooks/useFixedCostActions";
import { useFixedCostList } from "../hooks/useFixedCostList";
import { useFixedCostTable } from "../hooks/useFixedCostTable";
import { useFixedCostBulkActions } from "../hooks/useFixedCostBulkActions";
import { useFixedCostViewGroup } from "../hooks/useFixedCostViewGroup";

import { FixedCostDetailView } from "./FixedCostDetailView";

import { FixedCostResultsSection } from "../sections/list/FixedCostResultsSection";
import { FixedCostBulkActionsSection } from "../sections/list/FixedCostBulkActionsSection";
import { FixedCostMonthOverview } from "../sections/list/FixedCostMonthOverview";
import {
  FixedCostToolbar,
  FixedCostViewBar,
} from "../sections/list/FixedCostToolbar";
import { FixedCostInstallmentsView } from "../sections/list/FixedCostInstallmentsView";
import { FixedCostStatusBoard } from "../sections/list/FixedCostStatusBoard";
import { FixedCostEmptyMonth } from "../sections/list/FixedCostEmptyMonth";

import { MoveSeriesDialog } from "@/features/expenses/components/dialogs/MoveSeriesDialog";
import { FixedCostDialog } from "../components/dialogs/FixedCostDialog";
import { FixedCostPeriodSelector } from "../components/header/FixedCostPeriodSelector";

export function FixedCostListView() {
  const list = useFixedCostList();
  const interaction = useFixedCostActions();
  const bulk = useFixedCostBulkActions(list.filtered, list.scopeKey);
  const dataTable = useFixedCostTable({
    items: list.filtered,
    categories: list.categories,
    personName: list.personName,
    accountName: list.accountName,
    actions: interaction.actions,
    resetKey: list.scopeKey,
    rowSelection: bulk.selection,
    onSelectionChange: bulk.setSelection,
    pending: bulk.pending,
    sorting: list.sort
      ? { column: list.sort.column, desc: list.sort.desc }
      : undefined,
  });

  const openedItem =
    list.fixedCosts.find((cost) => cost.id === interaction.openedItem?.id) ??
    interaction.openedItem;
  const page = list.page;
  const viewGroup = useFixedCostViewGroup(page);
  const periodLabel =
    list.periodScope === "year"
      ? "del año"
      : list.filters.month && list.filters.year
        ? "del mes"
        : "del período";

  const toolbar = (
    <FixedCostToolbar
      filters={list.filters}
      onFiltersChange={list.setFilters}
      me={list.me}
      shown={list.filtered.length}
      total={list.fixedCosts.length}
      groupBy={list.groupBy}
      onGroupByChange={list.setGroupBy}
      sort={list.sort?.value}
      onSortChange={list.setSort}
      onResetView={() => {
        list.setFilters({ month: list.filters.month, year: list.filters.year });
        list.setSort(undefined);
        list.setGroupBy([]);
        list.setScope("all");
      }}
      view={list.view}
      onViewChange={list.setView}
      table={dataTable.table}
      canGroup={page !== "cuotas" && page !== "estado"}
      canSort={page !== "estado"}
      canChangeLayout={page !== "cuotas" && page !== "estado"}
      showPeriodInFilters
    />
  );

  let body;
  if (page === "cuotas")
    body = (
      <FixedCostInstallmentsView
        series={list.installments}
        categories={list.categories}
        personName={list.personName}
        loading={list.loading}
        onOpen={interaction.actions.onOpen}
        toolbar={toolbar}
        sort={list.sort?.value}
      />
    );
  else if (page === "estado")
    body = (
      <FixedCostStatusBoard
        items={list.baseFiltered}
        categories={list.categories}
        personName={list.personName}
        loading={list.loading}
        onOpen={interaction.actions.onOpen}
        onStatusChange={interaction.actions.onStatusChange}
      />
    );
  else if (
    page === "mes" &&
    !list.loading &&
    !list.error &&
    list.fixedCosts.length === 0 &&
    list.filters.month &&
    list.filters.year
  )
    body = (
      <FixedCostEmptyMonth
        month={Number(list.filters.month)}
        year={Number(list.filters.year)}
        onCreate={interaction.onCreate}
        onGoTo={(month, year) =>
          list.setFilters({
            ...list.filters,
            month: String(month),
            year: String(year),
          })
        }
      />
    );
  else
    body = (
      <>
        <FixedCostBulkActionsSection bulk={bulk} />
        <FixedCostResultsSection
          items={list.filtered}
          totalRecords={list.fixedCosts.length}
          categories={list.categories}
          personName={list.personName}
          view={list.view}
          groupBy={list.groupBy}
          dataTable={dataTable}
          loading={list.loading}
          error={list.error}
          pending={bulk.pending}
          emptyDescription={
            page === "por-pagar"
              ? "No tienes costos fijos pendientes. Todo está al día."
              : undefined
          }
          viewGroup={viewGroup}
        />
      </>
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-end sm:hidden">
        <FixedCostPeriodSelector />
      </div>
      <FixedCostViewBar
        page={page}
        onPageChange={list.setPage}
        exportItems={list.exportItems}
        onCreate={interaction.onCreate}
      />
      {page !== "cuotas" && (
        <FixedCostMonthOverview
          items={page === "por-pagar" ? list.filtered : list.baseFiltered}
          scope={page === "por-pagar" ? "payable" : list.scope}
          onScopeChange={page === "por-pagar" ? () => undefined : list.setScope}
          periodLabel={periodLabel}
          loading={list.loading}
          variant={page === "por-pagar" ? "payable" : "period"}
        />
      )}
      {page !== "cuotas" && toolbar}
      {body}
      <FixedCostDialog
        open={interaction.dialogOpen}
        onOpenChange={interaction.setDialogOpen}
        fixedCost={interaction.editingItem}
      />
      <FixedCostDetailView
        fixedCost={openedItem}
        categoryName={
          list.categories.find(
            (category) => category.id === openedItem?.categoryId,
          )?.name ?? "Sin categoría"
        }
        personName={list.personName(openedItem?.personId)}
        accountName={list.accountName(openedItem?.paymentMethodId)}
        onClose={interaction.onCloseDetail}
        onEdit={interaction.onEditDetail}
        initialTab={interaction.openedTab}
      />
      {interaction.moving && (
        <MoveSeriesDialog
          key={interaction.moving.id}
          source={interaction.moving}
          onClose={interaction.onCloseMove}
        />
      )}
    </div>
  );
}

export const FixedCostListPage = withQuery(FixedCostListView);
