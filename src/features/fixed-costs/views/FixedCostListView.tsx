import { withQuery } from "@/shared/api/query";
import { MoveSeriesDialog } from "@/features/expenses/components/dialogs/MoveSeriesDialog";
import { FixedCostDialog } from "../components/dialogs/FixedCostDialog";
import { useFixedCostActions } from "../hooks/useFixedCostActions";
import { useFixedCostList } from "../hooks/useFixedCostList";
import { FixedCostListControls } from "../sections/FixedCostListControls";
import { FixedCostResultsSection } from "../sections/FixedCostResultsSection";
import { FixedCostDetailView } from "./FixedCostDetailView";

export function FixedCostListView() {
  const list = useFixedCostList();
  const interaction = useFixedCostActions();

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
      />
      <FixedCostResultsSection
        items={list.filtered}
        totalRecords={list.fixedCosts.length}
        categories={list.categories}
        personName={list.personName}
        accountName={list.accountName}
        view={list.view}
        groupBy={list.groupBy}
        totals={list.totals}
        actions={interaction.actions}
      />
      <FixedCostDialog
        open={interaction.dialogOpen}
        onOpenChange={interaction.setDialogOpen}
        fixedCost={interaction.editingItem}
      />
      <FixedCostDetailView
        fixedCost={interaction.openedItem}
        categoryName={list.categories.find((category) => category.id === interaction.openedItem?.categoryId)?.name ?? "Sin categoría"}
        personName={list.personName(interaction.openedItem?.personId)}
        accountName={list.accountName(interaction.openedItem?.paymentMethodId)}
        onClose={interaction.onCloseDetail}
        onEdit={interaction.onEditDetail}
      />
      {interaction.moving && (
        <MoveSeriesDialog key={interaction.moving.id} source={interaction.moving} onClose={interaction.onCloseMove} />
      )}
    </div>
  );
}

export const FixedCostListPage = withQuery(FixedCostListView);
