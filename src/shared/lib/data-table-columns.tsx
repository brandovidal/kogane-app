import type { ColumnDef } from "@tanstack/react-table";
import type { Column } from "@/shared/types/data-view";
import { DATA_TABLE_SELECTION_COLUMN } from "@/shared/constants/data-table";
import { Checkbox } from "@/ui/checkbox";

/** Bridges the existing table/card definitions to TanStack without duplicating cells. */
export function toDataTableColumns<T>(columns: Column<T>[]): ColumnDef<T>[] {
  return columns.map((column) => ({
    id: column.key,
    header: column.role === "actions" ? "" : column.header,
    accessorFn: column.accessor,
    cell: ({ row }) => column.cell(row.original),
    enableSorting: !!column.accessor,
    enableHiding:
      column.hideable ?? (column.role !== "title" && column.role !== "actions"),
    meta: { label: column.header, className: column.className },
  }));
}

export function selectionColumn<T>(): ColumnDef<T> {
  return {
    id: DATA_TABLE_SELECTION_COLUMN,
    enableHiding: false,
    enableSorting: false,
    meta: { className: "w-10" },
    header: ({ table }) => (
      <Checkbox
        aria-label="Seleccionar todos los registros de esta página"
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        disabled={
          !table.getRowModel().rows.length ||
          !table.getRowModel().rows.some((row) => row.getCanSelect())
        }
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(checked === true)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Seleccionar registro ${row.index + 1}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
      />
    ),
  };
}
