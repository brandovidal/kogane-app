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
  summary,
  calculationStorageKey,
  calculationDefaults,
  tableClassName,
  calculationState,
  extraCard,
  compactCards = false,
  cardRenderer,
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
        {summary?.label && <div className="text-sm font-semibold">{summary.label}</div>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => cardRenderer ? (
            <div key={rowKey(item)}>{cardRenderer(item)}</div>
          ) : (
            <Card
              key={rowKey(item)}
              className={[
                compactCards && "py-3 sm:py-6",
                selected?.has(rowKey(item)) && "ring-2 ring-primary",
              ].filter(Boolean).join(" ") || undefined}
            >
              <CardContent
                className={compactCards ? "space-y-1.5 px-3 sm:space-y-2 sm:px-6" : "space-y-2 pt-6"}
              >
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
                {amount && <div className={compactCards ? "text-base font-medium sm:text-lg" : "text-lg"}>{amount.cell(item)}</div>}
                <dl className={compactCards ? "space-y-0.5 text-xs sm:space-y-1 sm:text-sm" : "space-y-1 text-sm"}>
                  {meta.map((column) => (
                    <div
                      key={column.key}
                      className="flex justify-between gap-3"
                    >
                      <dt className="text-muted-foreground">{column.header}</dt>
                      <dd
                        className={
                          compactCards
                            ? "min-w-0 whitespace-nowrap text-right"
                            : "min-w-0 text-right"
                        }
                      >
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
      summary={summary}
      calculationStorageKey={calculationStorageKey}
      calculationDefaults={calculationDefaults}
      tableClassName={tableClassName}
      calculationState={calculationState}
      selected={selected}
      onSelectedChange={onSelectedChange}
      selectionDisabled={selectionDisabled}
    />
  );
}
