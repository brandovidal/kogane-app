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
  selected,
  onSelectedChange,
  selectionDisabled,
}: DataViewProps<T> & {
  groupBy?: string;
  groupKey: (item: T, field: string) => string;
  groupLabel: (key: string, field: string) => string;
}) {
  if (groupBy === "none")
    return (
      <DataView
        items={items}
        columns={columns}
        rowKey={rowKey}
        view={view}
        footer={footer}
        extraCard={extraCard}
        selected={selected}
        onSelectedChange={onSelectedChange}
        selectionDisabled={selectionDisabled}
      />
    );
  const groups = new Map<string, T[]>();
  items.forEach((item) => {
    const key = groupKey(item, groupBy);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  });
  return (
    <div className="space-y-4">
      {[...groups].map(([key, rows], index) => (
        <section key={key} className="space-y-2">
          <h2 className="font-medium">
            {groupLabel(key, groupBy)}
            <span className="ml-2 text-xs text-muted-foreground">
              {rows.length}
            </span>
          </h2>
          <DataView
            items={rows}
            columns={columns}
            rowKey={rowKey}
            view={view}
            extraCard={index === 0 ? extraCard : undefined}
            selected={selected}
            onSelectedChange={onSelectedChange}
            selectionDisabled={selectionDisabled}
          />
        </section>
      ))}
      {footer && <div className="rounded-md border px-4 py-3">{footer}</div>}
    </div>
  );
}
