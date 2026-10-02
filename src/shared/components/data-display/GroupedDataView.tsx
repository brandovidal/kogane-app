import type { ReactNode } from "react";
import type { DataViewProps } from "@/shared/types/data-view";
import { DataView } from "./DataView";

export function GroupedDataView<T>({
  items,
  columns,
  rowKey,
  view,
  groupBy = "none",
  groupKey,
  groupLabel,
  footer,
  extraCard,
  compactCards,
  selected,
  onSelectedChange,
  selectionDisabled,
}: DataViewProps<T> & {
  groupBy?: string | readonly string[];
  groupKey: (item: T, field: string) => string;
  groupLabel: (key: string, field: string) => string;
}) {
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
        extraCard={extraCard}
        compactCards={compactCards}
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
          const content = depth + 1 < fields.length
            ? renderGroups(groupedRows, depth + 1)
            : <DataView
                items={groupedRows}
                columns={columns}
                rowKey={rowKey}
                view={view}
                extraCard={firstGroup ? (firstGroup = false, extraCard) : undefined}
                compactCards={compactCards}
                selected={selected}
                onSelectedChange={onSelectedChange}
                selectionDisabled={selectionDisabled}
              />;
          return (
            <section key={`${field}:${key}`} className="space-y-2">
              <h2 className={depth ? "text-sm font-medium" : "font-medium"}>
                {groupLabel(key, field)}
                <span className="ml-2 text-xs text-muted-foreground">{groupedRows.length}</span>
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
