import { useEffect, useState } from "react";
import { withQuery } from "@/shared/api/query";
import { useCsvExport } from "@/shared/hooks/useCsvExport";
import { usePlatformList } from "../hooks/usePlatformList";
import { usePlatformActions } from "../hooks/usePlatformActions";
import { usePlatformBulkActions } from "../hooks/usePlatformBulkActions";
import { usePlatformTable } from "../hooks/usePlatformTable";
import { PlatformPeriodSelector } from "../components/header/PlatformPeriodSelector";
import { SubscriptionDialog } from "../components/SubscriptionDialog";
import { MoveSeriesDialog } from "@/features/expenses/components/dialogs/MoveSeriesDialog";
import { PlatformViewBar } from "../sections/list/PlatformViewBar";
import { PlatformOverview } from "../sections/list/PlatformOverview";
import { PlatformToolbar } from "../sections/list/PlatformToolbar";
import { PlatformResults } from "../sections/list/PlatformResults";
import { PlatformBulkActions } from "../sections/list/PlatformBulkActions";
import { PlatformDetailPage } from "./PlatformDetailPage";
import { localTodayKey } from "@/features/fixed-costs/lib/fixed-cost-views";
import { formatDate } from "@/shared/lib/dates";

function PlatformListPageContent() {
  const list = usePlatformList();
  const actions = usePlatformActions();
  const bulk = usePlatformBulkActions(list.filtered, list.resetKey);
  const [todayKey, setTodayKey] = useState("");
  useEffect(() => setTodayKey(localTodayKey()), []);
  const tableState = usePlatformTable({
    items: list.filtered,
    personName: list.personName,
    todayKey,
    actions,
    resetKey: list.resetKey,
    selection: bulk.selection,
    onSelectionChange: bulk.setSelection,
    pending: bulk.pending,
  });
  const exportData = useCsvExport({
    filename: `plataformas-${list.year}-${String(list.month).padStart(2, "0")}`,
    headers: ["Plataforma", "Período", "Monto", "Moneda", "Estado", "Persona", "Próximo cobro", "Nota"],
    rows: list.filtered.map((item) => [
      item.description,
      item.period,
      String(item.amountInPen ?? item.amount),
      item.currency,
      item.paymentStatus,
      list.personName(item.personId),
      item.dueDate ? formatDate(item.dueDate) : "",
      item.notes ?? "",
    ]),
  });
  const selected = new Set(Object.keys(bulk.selection).filter((id) => bulk.selection[id]));
  const openedItem = list.items.find((item) => item.id === actions.openedItem?.id) ?? actions.openedItem;

  return <div className="space-y-4">
    <div className="flex justify-end sm:hidden"><PlatformPeriodSelector /></div>
    <PlatformViewBar view={list.view} onViewChange={list.setView} onCreate={actions.onCreate} exportItems={exportData.items} />
    <PlatformOverview items={list.filtered} todayKey={todayKey} loading={list.loading} />
    {list.view !== "calendar" && <PlatformToolbar filters={list.filters} onFiltersChange={list.setFilters} groupBy={list.groupBy} onGroupByChange={list.setGroupBy} table={tableState.table} />}
    <PlatformBulkActions bulk={bulk} />
    <PlatformResults
      items={list.filtered}
      total={list.items.length}
      view={list.view}
      groupBy={list.groupBy}
      tableState={tableState}
      personName={list.personName}
      loading={list.loading}
      error={list.error}
      month={list.month}
      year={list.year}
      selected={selected}
      onSelectionChange={(next) => bulk.setSelection(Object.fromEntries([...next].map((id) => [id, true])))}
      onCreate={actions.onCreate}
      onEdit={actions.onOpen}
      actions={actions}
    />
    <PlatformDetailPage
      item={openedItem}
      items={list.filtered}
      personName={list.personName(openedItem?.personId)}
      accountName={list.accountName(openedItem?.paymentMethodId)}
      initialTab={actions.openedTab}
      todayKey={todayKey}
      onClose={actions.onCloseDetail}
      onEdit={() => openedItem && actions.onEdit(openedItem)}
      onDelete={(item) => actions.onDelete(item)}
      onNavigate={(item) => actions.onOpen(item)}
    />
    <SubscriptionDialog open={actions.dialogOpen} onOpenChange={actions.setDialogOpen} subscription={actions.editing} platformMode />
    {actions.moving && <MoveSeriesDialog key={actions.moving.id} source={actions.moving} onClose={() => actions.setMoving(null)} />}
  </div>;
}

export const PlatformListPage = withQuery(PlatformListPageContent);
