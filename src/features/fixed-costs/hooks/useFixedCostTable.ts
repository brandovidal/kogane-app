import { useMemo } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import type { Category, FixedCost } from "@/shared/api/types";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { toDataTableColumns } from "@/shared/lib/data-table-columns";
import { getFixedCostColumns } from "../sections/list/fixed-cost-columns";
import type { CatalogName, FixedCostActions } from "../types/fixed-cost-types";

export function useFixedCostTable({
  items,
  categories,
  personName,
  accountName,
  actions,
  resetKey,
  rowSelection,
  onSelectionChange,
  pending,
  sorting,
}: {
  items: FixedCost[];
  categories: Category[];
  personName: CatalogName;
  accountName: CatalogName;
  actions: FixedCostActions;
  resetKey: string;
  rowSelection: RowSelectionState;
  onSelectionChange: (selection: RowSelectionState) => void;
  pending: boolean;
  sorting?: { column: string; desc: boolean };
}) {
  const columns = useMemo(
    () => getFixedCostColumns({ categories, personName, accountName, actions }),
    [categories, personName, accountName, actions],
  );
  const definitions = useMemo(() => toDataTableColumns(columns), [columns]);
  const table = useDataTable({
    items,
    columns: definitions,
    rowKey: (cost) => cost.id,
    selectable: true,
    resetKey,
    selectionDisabled: pending,
    state: {
      rowSelection,
      sorting: sorting ? [{ id: sorting.column, desc: sorting.desc }] : [],
    },
    onRowSelectionChange: (updater) =>
      onSelectionChange(
        typeof updater === "function" ? updater(rowSelection) : updater,
      ),
  });
  return {
    table,
    visibleColumns: columns.filter((column) =>
      table.getColumn(column.key)?.getIsVisible(),
    ),
    selected: new Set(
      Object.keys(rowSelection).filter((id) => rowSelection[id]),
    ),
    onSelectedChange: (selected: Set<string>) =>
      onSelectionChange(
        Object.fromEntries([...selected].map((id) => [id, true])),
      ),
  };
}
