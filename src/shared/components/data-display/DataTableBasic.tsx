import { flexRender } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { DataTableBasicProps } from "@/shared/types/data-table";
import { DataTableColumnCalculation } from "./DataTableColumnCalculation";
import { useDataTableCalculations } from "@/shared/hooks/useDataTableCalculations";
import { calculateTableColumn } from "@/shared/lib/data-table-calculations";
import { DATA_TABLE_SELECTION_COLUMN } from "@/shared/constants/data-table";
import { cn } from "@/shared/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
  TableRow,
} from "@/ui/table";

export function DataTableBasic<T>({
  table,
  className,
  loading,
  error,
  emptyMessage = "Sin registros",
  footer,
  calculationStorageKey,
  calculationDefaults,
  calculationState,
  rowClassName,
  rowIsSelected,
}: DataTableBasicProps<T>) {
  const rows = table.getRowModel().rows;
  const calculationRows = table.getPrePaginationRowModel().rows;
  const localCalculationState = useDataTableCalculations(
    calculationState ? undefined : calculationStorageKey,
    calculationDefaults,
  );
  const { selection: calculations, setCalculation } = calculationState ?? localCalculationState;
  return (
    <div
      className={cn("overflow-hidden rounded-md border", className)}
      aria-busy={loading || undefined}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className={header.column.columnDef.meta?.className}
                  aria-sort={
                    header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : undefined
                  }
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="group inline-flex items-center gap-1.5 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUp aria-hidden="true" className="size-3.5" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown aria-hidden="true" className="size-3.5" />
                      ) : (
                        <ArrowUpDown
                          aria-hidden="true"
                          className="size-3 opacity-0 group-hover:opacity-50 group-focus-visible:opacity-50"
                        />
                      )}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading || error || !rows.length ? (
            <TableRow className="group/calculation-footer">
              <TableCell
                colSpan={table.getVisibleLeafColumns().length}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {error ? (
                  <div role="alert">{error}</div>
                ) : loading ? (
                  <span role="status">Cargando registros…</span>
                ) : (
                  <div role="status" className="w-full whitespace-normal">
                    {emptyMessage}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={rowClassName?.(row.original)}
                data-state={
                  rowIsSelected?.(row.original) || row.getIsSelected()
                    ? "selected"
                    : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.className}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
        {calculationStorageKey && !loading && !error && (
          <TableFooter>
            <TableRow>
              {table.getVisibleLeafColumns().map((column) => {
                const meta = column.columnDef.meta;
                const calculation = calculations[column.id] ?? "none";
                if (!meta?.label || column.id === DATA_TABLE_SELECTION_COLUMN || meta.calculationType === false) {
                  return <TableCell key={column.id} className={meta?.className} />;
                }
                const values = calculationRows.map((row) => row.getValue(column.id));
                const present = values.filter((value) => value != null && value !== "");
                const numeric = meta.calculationType === "number" || (
                  meta.calculationType !== "text" && present.length > 0 && present.every((value) => typeof value === "number" && Number.isFinite(value))
                );
                const result = calculateTableColumn(values, calculation);
                const formatted = result == null || !["sum", "average", "median", "min", "max", "range"].includes(calculation)
                  ? null
                  : meta.formatCalculation?.(result);
                const copyValue = result == null
                  ? ""
                  : formatted ?? new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 }).format(result);
                return (
                  <TableCell key={column.id} className={`${meta.className ?? ""} group/calculation-cell`}>
                    <div className={cn("flex", meta.className?.includes("text-right") ? "justify-end" : "justify-start")}>
                      <DataTableColumnCalculation
                        value={result}
                        calculation={calculation}
                        numeric={numeric}
                        onChange={(next) => setCalculation(column.id, next)}
                        formattedValue={formatted ?? undefined}
                        copyValue={copyValue}
                      />
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableFooter>
        )}
      </Table>
      {footer && <div className="border-t px-4 py-3">{footer}</div>}
    </div>
  );
}
