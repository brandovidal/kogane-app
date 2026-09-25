import { useEffect, useState, type ReactNode } from "react";
import { LayoutGrid, Table2 } from "lucide-react";

import { Card, CardContent } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

export type ViewMode = "table" | "cards";

// One definition of the columns shows a list as a table or as cards (D80). In cards: the title and the actions go on
// top, the amount big, and the rest as "Header: value" lines.
export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  role?: "title" | "amount" | "actions" | "meta";
  className?: string;
}

interface DataViewProps<T> {
  items: T[];
  columns: Column<T>[];
  rowKey: (item: T) => string;
  view: ViewMode;
  footer?: ReactNode; // under the table, or under the cards
  extraCard?: ReactNode; // e.g. the dashed "Nueva plataforma" card
  // Selección múltiple (D115): a checkbox per row (and one for all in the table header)
  selected?: Set<string>;
  onSelectedChange?: (selected: Set<string>) => void;
}

export function DataView<T>({
  items,
  columns,
  rowKey,
  view,
  footer,
  extraCard,
  selected,
  onSelectedChange,
}: DataViewProps<T>) {
  const selectable = !!selected && !!onSelectedChange;
  const toggle = (key: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    onSelectedChange?.(next);
  };
  const keys = items.map(rowKey);
  const allChecked = keys.length > 0 && keys.every((key) => selected?.has(key));
  const someChecked = keys.some((key) => selected?.has(key));
  const toggleAll = (checked: boolean) => {
    const next = new Set(selected);
    keys.forEach((key) => (checked ? next.add(key) : next.delete(key)));
    onSelectedChange?.(next);
  };

  if (view === "cards") {
    const title = columns.find((column) => column.role === "title");
    const amount = columns.find((column) => column.role === "amount");
    const actions = columns.find((column) => column.role === "actions");
    const meta = columns.filter((column) => !column.role || column.role === "meta");
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={rowKey(item)} className={selected?.has(rowKey(item)) ? "ring-2 ring-primary" : undefined}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-start justify-between gap-2">
                  {selectable && (
                    <Checkbox
                      className="mt-1"
                      aria-label="Seleccionar"
                      checked={selected.has(rowKey(item))}
                      onCheckedChange={(checked) => toggle(rowKey(item), checked === true)}
                    />
                  )}
                  <div className="min-w-0 flex-1">{title?.cell(item)}</div>
                  {actions && <div className="shrink-0">{actions.cell(item)}</div>}
                </div>
                {amount && <div className="text-lg">{amount.cell(item)}</div>}
                <dl className="space-y-1 text-sm">
                  {meta.map((column) => (
                    <div key={column.key} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{column.header}</dt>
                      <dd className="min-w-0 text-right">{column.cell(item)}</dd>
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-[36px]">
                <Checkbox
                  aria-label="Seleccionar todas"
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.role === "actions" ? "" : column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={rowKey(item)} data-state={selected?.has(rowKey(item)) ? "selected" : undefined}>
              {selectable && (
                <TableCell>
                  <Checkbox
                    aria-label="Seleccionar"
                    checked={selected.has(rowKey(item))}
                    onCheckedChange={(checked) => toggle(rowKey(item), checked === true)}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {footer && <div className="border-t px-4 py-3">{footer}</div>}
    </div>
  );
}

const STORAGE_PREFIX = "kogane:view:";

// The view of each page, remembered in this browser (a convenience: without storage it uses the default)
export function useViewMode(page: string, initial: ViewMode): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(initial);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + page);
      if (stored === "table" || stored === "cards") setMode(stored);
    } catch {
      // keep the default
    }
  }, [page]);
  const update = (next: ViewMode) => {
    setMode(next);
    try {
      localStorage.setItem(STORAGE_PREFIX + page, next);
    } catch {
      // not remembered
    }
  };
  return [mode, update];
}

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (mode: ViewMode) => void }) {
  const option = (mode: ViewMode, label: string, Icon: typeof Table2) => (
    <button
      type="button"
      aria-pressed={value === mode}
      aria-label={label}
      title={label}
      onClick={() => onChange(mode)}
      className={`rounded px-2 py-1 ${value === mode ? "bg-muted text-foreground" : "text-muted-foreground"}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
  return (
    <div className="flex rounded-md border p-0.5">
      {option("table", "Tabla", Table2)}
      {option("cards", "Tarjetas", LayoutGrid)}
    </div>
  );
}
