import type { Subscription } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { DataTableComplex } from "@/shared/components/data-display/DataTableComplex";
import { DataTablePagination } from "@/shared/components/data-display/DataTablePagination";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { DataLoadingSkeleton } from "@/shared/components/data-display/DataLoadingSkeleton";
import { formatCurrency } from "@/shared/lib/currency";
import { Button } from "@/ui/button";
import { PlatformCalendarView } from "../../views/PlatformCalendarView";
import { PlatformCardsView } from "../../views/PlatformCardsView";
import { PlatformPeriodView } from "../../views/PlatformPeriodView";
import type { PlatformView } from "./PlatformViewBar";
import { layoutForPlatformView } from "./PlatformViewBar";
import { SUBSCRIPTION_PERIOD_LABELS } from "../../constants/subscriptions";
import { platformAmount } from "../../lib/platform-summary";
import { localTodayKey } from "@/shared/lib/dates";
import type { usePlatformTable } from "../../hooks/usePlatformTable";
import type { usePlatformActions } from "../../hooks/usePlatformActions";

export function PlatformResults({
  items,
  total,
  view,
  groupBy,
  tableState,
  personName,
  loading,
  error,
  month,
  year,
  selected,
  onSelectionChange,
  onCreate,
  onEdit,
  actions,
}: {
  items: Subscription[];
  total: number;
  view: PlatformView;
  groupBy: Array<"person" | "period">;
  tableState: ReturnType<typeof usePlatformTable>;
  personName: (id: string | null | undefined) => string;
  loading: boolean;
  error: boolean;
  month: number;
  year: number;
  selected: Set<string>;
  onSelectionChange: (selection: Set<string>) => void;
  onCreate: () => void;
  onEdit: (item: Subscription, tab?: "detail" | "files" | "history") => void;
  actions: ReturnType<typeof usePlatformActions>;
}) {
  const empty = (
    <EmptyState
      title={total ? "Sin resultados" : "Aún no hay plataformas"}
      description={
        total
          ? "Prueba con otros filtros o cambia el período."
          : "Agrega tu primera plataforma para ver sus cobros aquí."
      }
      action={
        !total && (
          <Button type="button" size="sm" onClick={onCreate}>
            Nueva plataforma
          </Button>
        )
      }
    />
  );
  if (view === "calendar") {
    if (loading) return <DataLoadingSkeleton variant="cards" />;
    if (error)
      return (
        <p role="alert" className="py-8 text-center text-sm text-destructive">
          No se pudieron cargar las plataformas.
        </p>
      );
    return items.length || !total ? (
      <PlatformCalendarView
        items={items}
        month={month}
        year={year}
        onOpen={onEdit}
      />
    ) : (
      empty
    );
  }
  if (view === "cards" || view === "period") {
    if (loading) return <DataLoadingSkeleton variant="cards" />;
    if (error)
      return (
        <p role="alert" className="py-8 text-center text-sm text-destructive">
          No se pudieron cargar las plataformas.
        </p>
      );
    if (!items.length && total) return empty;
    const visibleItems = tableState.table
      .getRowModel()
      .rows.map((row) => row.original);
    return (
      <div className="space-y-4">
        {view === "cards" ? (
          <PlatformCardsView
            items={visibleItems}
            personName={personName}
            todayKey={localTodayKey()}
            onOpen={onEdit}
            onCreate={onCreate}
            onEdit={actions.onEdit}
            onDuplicate={actions.onDuplicate}
            onNextMonth={actions.onNextMonth}
            onMove={actions.onMove}
            onDelete={actions.onDelete}
            onStatusChange={actions.onStatusChange}
          />
        ) : (
          <PlatformPeriodView
            items={visibleItems}
            personName={personName}
            todayKey={localTodayKey()}
            onOpen={onEdit}
            onCreate={onCreate}
          />
        )}
        {items.length > 0 && <DataTablePagination table={tableState.table} />}
      </div>
    );
  }
  const effectiveGroup = groupBy;
  const isGrouped = effectiveGroup.length > 0;
  const layout = layoutForPlatformView(view);
  if (layout === "table" && !isGrouped)
    return (
      <DataTableComplex
        table={tableState.table}
        className="platform-table"
        calculationStorageKey={items.length ? "platforms" : undefined}
        calculationDefaults={{ description: "count", amount: "sum" }}
        pagination={items.length > 0}
        loading={loading}
        error={error ? "No se pudieron cargar las plataformas." : undefined}
        emptyMessage={empty}
      />
    );
  if (loading)
    return (
      <DataLoadingSkeleton
        variant={layout === "table" ? "table" : "cards"}
        columns={tableState.columns.length}
      />
    );
  if (error)
    return (
      <p role="alert" className="py-8 text-center text-sm text-destructive">
        No se pudieron cargar las plataformas.
      </p>
    );
  if (!items.length) return empty;
  return (
    <div className="space-y-3">
      <GroupedDataView
        items={tableState.table.getRowModel().rows.map((row) => row.original)}
        columns={tableState.columns}
        rowKey={(item) => item.id}
        view={layout}
        groupBy={effectiveGroup}
        groupKey={(item, field) =>
          field === "person" ? (item.personId ?? "none") : item.period
        }
        groupLabel={(key, field) =>
          field === "person"
            ? key === "none"
              ? "Sin persona"
              : personName(key)
            : (SUBSCRIPTION_PERIOD_LABELS[key] ?? key)
        }
        summaryForGroup={
          !isGrouped
            ? undefined
            : (groupItems) => ({
                label: (
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(
                      groupItems.reduce(
                        (sum, item) => sum + platformAmount(item),
                        0,
                      ),
                    )}
                  </span>
                ),
              })
        }
        calculationStorageKey="platforms"
        calculationDefaults={{ description: "count", amount: "sum" }}
        tableClassName="platform-table"
        compactCards
        selected={selected}
        onSelectedChange={onSelectionChange}
      />
      <DataTablePagination table={tableState.table} />
    </div>
  );
}
