import { withQuery } from "@/shared/api/query";
import { MoveSeriesDialog } from "@/features/expenses/components/dialogs/MoveSeriesDialog";
import { FixedCostDialog } from "../components/dialogs/FixedCostDialog";
import { useFixedCostActions } from "../hooks/useFixedCostActions";
import { useFixedCostList } from "../hooks/useFixedCostList";
import { FixedCostListControls } from "../sections/list/FixedCostListControls";
import { FixedCostResultsSection } from "../sections/list/FixedCostResultsSection";
import { FixedCostDetailView } from "./FixedCostDetailView";
import { DataTableColumnSelector } from "@/shared/components/data-display/DataTableColumnSelector";
import { useFixedCostTable } from "../hooks/useFixedCostTable";
import { useFixedCostBulkActions } from "../hooks/useFixedCostBulkActions";
import { FixedCostBulkActionsSection } from "../sections/list/FixedCostBulkActionsSection";

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
  });
  const openedItem =
    list.fixedCosts.find((cost) => cost.id === interaction.openedItem?.id) ??
    interaction.openedItem;

  return (
    <div className="space-y-4">
      <FixedCostListControls
        filters={list.filters}
        onFiltersChange={list.setFilters}
        me={list.me}
        shown={list.filtered.length}
        total={list.fixedCosts.length}
        view={list.view}
        onViewChange={list.setView}
        groupBy={list.groupBy}
        onGroupByChange={list.setGroupBy}
        exportItems={list.exportItems}
        onCreate={interaction.onCreate}
        columnSelector={
          <DataTableColumnSelector
            table={dataTable.table}
            disabled={list.loading}
          />
        }
      />
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
      />
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
