import { useEffect, useState } from "react";
import { withQuery } from "@/shared/api/query";
import { MoveSeriesDialog } from "@/features/expenses/components/dialogs/MoveSeriesDialog";
import { FixedCostDialog } from "../components/dialogs/FixedCostDialog";
import { useFixedCostActions } from "../hooks/useFixedCostActions";
import { useFixedCostList } from "../hooks/useFixedCostList";
import { FixedCostResultsSection } from "../sections/list/FixedCostResultsSection";
import { FixedCostDetailView } from "./FixedCostDetailView";
import { useFixedCostTable } from "../hooks/useFixedCostTable";
import { useFixedCostBulkActions } from "../hooks/useFixedCostBulkActions";
import { FixedCostBulkActionsSection } from "../sections/list/FixedCostBulkActionsSection";
import { FixedCostMonthOverview } from "../sections/list/FixedCostMonthOverview";
import { FixedCostToolbar, FixedCostViewBar } from "../sections/list/FixedCostToolbar";
import { FixedCostInstallmentsView } from "../sections/list/FixedCostInstallmentsView";
import { FixedCostStatusBoard } from "../sections/list/FixedCostStatusBoard";
import { FixedCostEmptyMonth } from "../sections/list/FixedCostEmptyMonth";
import {
  URGENCY_GROUPS,
  localTodayKey,
  monthGroupKey,
  monthGroupLabel,
  urgencyOf,
} from "../lib/fixed-cost-views";

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
    sorting: list.sort ? { column: list.sort.column, desc: list.sort.desc } : undefined,
  });
  const [todayKey, setTodayKey] = useState("");
  useEffect(() => setTodayKey(localTodayKey()), []);
  const openedItem =
    list.fixedCosts.find((cost) => cost.id === interaction.openedItem?.id) ??
    interaction.openedItem;
  const page = list.page;
  const periodLabel =
    list.periodScope === "year" ? "del año" : list.filters.month && list.filters.year ? "del mes" : "del período";

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
      view={list.view}
      onViewChange={list.setView}
      table={dataTable.table}
      canGroup={page !== "cuotas" && page !== "estado"}
      canSort={page !== "cuotas" && page !== "estado"}
      canChangeLayout={page !== "cuotas" && page !== "estado"}
      showPeriodInFilters={list.periodScope !== "none"}
    />
  );

  let body;
  if (page === "cuotas")
    body = (
      <FixedCostInstallmentsView
        items={list.baseFiltered}
        categories={list.categories}
        personName={list.personName}
        loading={list.loading}
        onOpen={interaction.actions.onOpen}
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
          list.setFilters({ ...list.filters, month: String(month), year: String(year) })
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
          emptyDescription={page === "por-pagar" ? "No tienes costos fijos pendientes. Todo está al día." : undefined}
          viewGroup={
            page === "por-pagar"
              ? {
                  field: "urgency",
                  key: (cost) => urgencyOf(cost, todayKey || localTodayKey()),
                  label: (key) => URGENCY_GROUPS.find((group) => group.value === key)?.label ?? key,
                }
              : page === "todos"
                ? { field: "month", key: monthGroupKey, label: monthGroupLabel }
                : undefined
          }
        />
      </>
    );

  return (
    <div className="space-y-4">
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
          periodLabel={page === "por-pagar" ? "pendiente" : periodLabel}
          loading={list.loading}
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
