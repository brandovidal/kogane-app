import type { DataTableComplexProps } from "@/shared/types/data-table";
import { DataTableBasic } from "./DataTableBasic";
import { DataTablePagination } from "./DataTablePagination";

/** Composes the same basic renderer with controls; domain actions belong to the feature. */
export function DataTableComplex<T>({
  toolbar,
  pagination = true,
  ...props
}: DataTableComplexProps<T>) {
  return (
    <div className="space-y-3">
      {toolbar}
      <DataTableBasic {...props} />
      {pagination && (
        <DataTablePagination
          table={props.table}
          disabled={props.loading || !!props.error}
        />
      )}
    </div>
  );
}
