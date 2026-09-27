import { Card, CardContent } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { DataViewTable } from "./DataViewTable";
import type { DataViewProps } from "@/shared/types/data-view";

export function DataView<T>({
  items,
  columns,
  rowKey,
  view,
  footer,
  extraCard,
  selected,
  onSelectedChange,
  selectionDisabled,
}: DataViewProps<T>) {
  const selectable = !!selected && !!onSelectedChange;
  const toggle = (key: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    onSelectedChange?.(next);
  };

  if (view === "cards") {
    const title = columns.find((column) => column.role === "title");
    const amount = columns.find((column) => column.role === "amount");
    const actions = columns.find((column) => column.role === "actions");
    const meta = columns.filter(
      (column) => !column.role || column.role === "meta",
    );
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={rowKey(item)}
              className={
                selected?.has(rowKey(item)) ? "ring-2 ring-primary" : undefined
              }
            >
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-start justify-between gap-2">
                  {selectable && (
                    <Checkbox
                      className="mt-1"
                      disabled={selectionDisabled}
                      aria-label="Seleccionar"
                      checked={selected.has(rowKey(item))}
                      onCheckedChange={(checked) =>
                        toggle(rowKey(item), checked === true)
                      }
                    />
                  )}
                  <div className="min-w-0 flex-1">{title?.cell(item)}</div>
                  {actions && (
                    <div className="shrink-0">{actions.cell(item)}</div>
                  )}
                </div>
                {amount && <div className="text-lg">{amount.cell(item)}</div>}
                <dl className="space-y-1 text-sm">
                  {meta.map((column) => (
                    <div
                      key={column.key}
                      className="flex justify-between gap-3"
                    >
                      <dt className="text-muted-foreground">{column.header}</dt>
                      <dd className="min-w-0 text-right">
                        {column.cell(item)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          ))}
          {extraCard}
        </div>
        {footer}
      </div>
    );
  }

  return (
    <DataViewTable
      items={items}
      columns={columns}
      rowKey={rowKey}
      footer={footer}
      selected={selected}
      onSelectedChange={onSelectedChange}
      selectionDisabled={selectionDisabled}
    />
  );
}
