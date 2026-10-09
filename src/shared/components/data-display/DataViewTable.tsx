import { useMemo } from "react";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { toDataTableColumns } from "@/shared/lib/data-table-columns";
import type { DataViewProps } from "@/shared/types/data-view";
import { DataTableBasic } from "./DataTableBasic";

/** Compatibility adapter for lists that have not adopted controlled table state yet. */
export function DataViewTable<T>({
  items,
  columns,
  rowKey,
  footer,
  summary: _summary,
  calculationStorageKey,
  calculationDefaults,
  tableClassName,
  calculationState,
  selected,
  onSelectedChange,
  selectionDisabled,
}: Omit<DataViewProps<T>, "view">) {
  const definitions = useMemo(
    () =>
      toDataTableColumns(columns).map((column) => ({
        ...column,
        enableSorting: false,
      })),
    [columns],
  );
  const selection = useMemo(
    () => Object.fromEntries([...(selected ?? [])].map((id) => [id, true])),
    [selected],
  );
  const table = useDataTable({
    items,
    columns: definitions,
    rowKey,
    paginationEnabled: false,
    selectable: !!selected && !!onSelectedChange,
    selectionDisabled,
    state: { rowSelection: selection },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(selection) : updater;
      onSelectedChange?.(new Set(Object.keys(next).filter((id) => next[id])));
    },
  });
  return (
    <DataTableBasic
      table={table}
      className={tableClassName}
      footer={footer}
      calculationStorageKey={calculationStorageKey}
      calculationDefaults={calculationDefaults}
      calculationState={calculationState}
    />
  );
}
