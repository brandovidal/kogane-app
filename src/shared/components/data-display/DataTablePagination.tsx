import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DATA_TABLE_PAGE_SIZES } from "@/shared/constants/data-table";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

export function DataTablePagination<T>({
  table,
  disabled = false,
}: {
  table: Table<T>;
  disabled?: boolean;
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const rowCount = table.getRowCount();
  const pageCount = Math.max(1, table.getPageCount());
  const from = rowCount ? pageIndex * pageSize + 1 : 0;
  const to = Math.min((pageIndex + 1) * pageSize, rowCount);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
      <span aria-live="polite">
        {from}–{to} de {rowCount} registros
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span>Por página</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger
              size="sm"
              aria-label="Registros por página"
              className="h-8"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATA_TABLE_PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span>
          Página {pageIndex + 1} de {pageCount}
        </span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Página anterior"
            disabled={disabled || !table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Página siguiente"
            disabled={disabled || !table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
