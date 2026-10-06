import { useMemo } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { useDataTable } from "@/shared/hooks/useDataTable";
import { toDataTableColumns } from "@/shared/lib/data-table-columns";
import type { Subscription } from "@/shared/api/types";
import { getPlatformColumns } from "../lib/platform-columns";

export function usePlatformTable({
  items, personName, todayKey, actions, resetKey, selection, onSelectionChange, pending,
}: {
  items: Subscription[];
  personName: (id: string | null | undefined) => string;
  todayKey: string;
  actions: Parameters<typeof getPlatformColumns>[0]["actions"];
  resetKey: string;
  selection: RowSelectionState;
  onSelectionChange: (selection: RowSelectionState) => void;
  pending: boolean;
}) {
  const columns = useMemo(
    () => getPlatformColumns({ personName, todayKey, actions }),
    [personName, todayKey, actions],
  );
  const definitions = useMemo(() => toDataTableColumns(columns), [columns]);
  const table = useDataTable({
    items, columns: definitions, rowKey: (item) => item.id,
    selectable: true, resetKey, selectionDisabled: pending,
    state: { rowSelection: selection },
    onRowSelectionChange: (updater) => onSelectionChange(
      typeof updater === "function" ? updater(selection) : updater,
    ),
  });
  return { table, columns: columns.filter((column) => table.getColumn(column.key)?.getIsVisible()) };
}
