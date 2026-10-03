import type { ReactNode } from "react";
import type { DataViewProps, DataViewSummary } from "@/shared/types/data-view";
import { useDataTableCalculations } from "@/shared/hooks/useDataTableCalculations";
import { DataView } from "./DataView";

export function GroupedDataView<T>({
  items,
  columns,
  rowKey,
  view,
  groupBy = "none",
  groupKey,
  groupLabel,
  summaryForGroup,
  calculationStorageKey,
  calculationDefaults,
  tableClassName,
  footer,
  extraCard,
  compactCards,
  cardRenderer,
  selected,
  onSelectedChange,
  selectionDisabled,
}: DataViewProps<T> & {
  groupBy?: string | readonly string[];
  groupKey: (item: T, field: string) => string;
  groupLabel: (key: string, field: string) => string;
  summaryForGroup?: (items: T[]) => DataViewSummary;
}) {
  const calculationState = useDataTableCalculations(calculationStorageKey, calculationDefaults);
  const fields = Array.isArray(groupBy)
    ? groupBy
    : groupBy === "none"
      ? []
      : [groupBy];
  if (!fields.length)
    return (
      <DataView
        items={items}
        columns={columns}
        rowKey={rowKey}
        view={view}
        footer={footer}
        summary={summaryForGroup?.(items)}
        calculationStorageKey={calculationStorageKey}
        calculationDefaults={calculationDefaults}
        tableClassName={tableClassName}
        calculationState={calculationState}
        extraCard={extraCard}
        compactCards={compactCards}
        cardRenderer={cardRenderer}
        selected={selected}
        onSelectedChange={onSelectedChange}
        selectionDisabled={selectionDisabled}
      />
    );
  let firstGroup = true;
  const renderGroups = (rows: T[], depth: number): ReactNode => {
    const field = fields[depth];
    const groups = new Map<string, T[]>();
    rows.forEach((item) => {
      const key = groupKey(item, field);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });
    return (
      <div className={depth ? "ml-3 space-y-3 border-l pl-3 sm:ml-5 sm:pl-5" : "space-y-4"}>
        {[...groups].map(([key, groupedRows]) => {
          const summary = summaryForGroup?.(groupedRows);
          const content = depth + 1 < fields.length
            ? renderGroups(groupedRows, depth + 1)
            : <DataView
                items={groupedRows}
                columns={columns}
                rowKey={rowKey}
                view={view}
                summary={undefined}
                calculationStorageKey={calculationStorageKey}
                calculationDefaults={calculationDefaults}
                tableClassName={tableClassName}
                calculationState={calculationState}
                extraCard={firstGroup ? (firstGroup = false, extraCard) : undefined}
                compactCards={compactCards}
                cardRenderer={cardRenderer}
                selected={selected}
                onSelectedChange={onSelectedChange}
                selectionDisabled={selectionDisabled}
              />;
          return (
            <section key={`${field}:${key}`} className="space-y-2">
              <h2 className={`flex items-baseline justify-between gap-3 ${depth ? "text-sm font-medium" : "font-medium"}`}>
                <span className="min-w-0 truncate">
                  {groupLabel(key, field)}
                  <span className="ml-2 text-xs text-muted-foreground">{groupedRows.length}</span>
                </span>
                {view === "cards" && summary?.label}
              </h2>
              {content}
            </section>
          );
        })}
      </div>
    );
  };
  return (
    <div className="space-y-4">
      {renderGroups(items, 0)}
      {footer && <div className="rounded-md border px-4 py-3">{footer}</div>}
    </div>
  );
}
