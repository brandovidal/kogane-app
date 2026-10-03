import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { DATA_TABLE_PAGE_SIZE } from "@/shared/constants/data-table";
import { selectionColumn } from "@/shared/lib/data-table-columns";
import type { UseDataTableOptions } from "@/shared/types/data-table";
export type { UseDataTableOptions } from "@/shared/types/data-table";

export function useDataTable<T>({
  items,
  columns,
  rowKey,
  selectable = false,
  selectionDisabled = false,
  paginationEnabled = true,
  mode = "client",
  rowCount,
  resetKey,
  state,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onSearchChange,
  onRowSelectionChange,
  onColumnVisibilityChange,
  onQueryChange,
}: UseDataTableOptions<T>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DATA_TABLE_PAGE_SIZE,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [search, setSearch] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const tableColumns = useMemo(
    () => (selectable ? [selectionColumn<T>(), ...columns] : columns),
    [columns, selectable],
  );
  const server = mode === "server";
  const table = useReactTable({
    data: items,
    columns: tableColumns,
    getRowId: rowKey,
    state: {
      pagination: state?.pagination ?? pagination,
      sorting: state?.sorting ?? sorting,
      columnFilters: state?.columnFilters ?? columnFilters,
      globalFilter: state?.search ?? search,
      rowSelection: state?.rowSelection ?? rowSelection,
      columnVisibility: state?.columnVisibility ?? columnVisibility,
    },
    onPaginationChange: onPaginationChange ?? setPagination,
    onSortingChange: onSortingChange ?? setSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setColumnFilters,
    onGlobalFilterChange: onSearchChange ?? setSearch,
    onRowSelectionChange: onRowSelectionChange ?? setRowSelection,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setColumnVisibility,
    enableRowSelection: selectable && !selectionDisabled,
    manualPagination: server || !paginationEnabled,
    manualFiltering: server,
    manualSorting: server,
    rowCount,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const current = table.getState();
  const filterKey = JSON.stringify([
    resetKey,
    current.globalFilter,
    current.columnFilters,
    current.sorting,
  ]);
  const previousFilterKey = useRef(filterKey);
  const filtersChanged = previousFilterKey.current !== filterKey;
  useEffect(() => {
    if (!filtersChanged) return;
    previousFilterKey.current = filterKey;
    table.setPageIndex(0);
  }, [filterKey, filtersChanged, table]);

  // Keep a valid page after deletes or a smaller response; unknown server totals stay under caller control.
  const count = server
    ? rowCount
    : table.getPrePaginationRowModel().rows.length;
  useEffect(() => {
    if (!paginationEnabled || count === undefined) return;
    const last = Math.max(
      0,
      Math.ceil(count / current.pagination.pageSize) - 1,
    );
    if (current.pagination.pageIndex > last) table.setPageIndex(last);
  }, [
    count,
    current.pagination.pageIndex,
    current.pagination.pageSize,
    paginationEnabled,
    table,
  ]);

  useEffect(() => {
    // Skip the old page when filters changed; emit the new query after the reset takes effect.
    if (!filtersChanged)
      onQueryChange?.({
        pagination: current.pagination,
        sorting: current.sorting,
        columnFilters: current.columnFilters,
        search: current.globalFilter,
      });
  }, [
    current.pagination,
    current.sorting,
    current.columnFilters,
    current.globalFilter,
    filtersChanged,
    onQueryChange,
  ]);
  return table;
}
