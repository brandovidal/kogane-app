import { useSkeletonItems } from "@/shared/hooks/useSkeletonItems";
import { Skeleton } from "@/ui/skeleton";
import { TableCell, TableRow } from "@/ui/table";

type DataLoadingSkeletonVariant =
  | "summary"
  | "toolbar"
  | "table"
  | "table-rows"
  | "cards"
  | "board";

export function DataLoadingSkeleton({
  variant,
  count = 4,
  rows = 4,
  columns = 6,
  className,
}: {
  variant: DataLoadingSkeletonVariant;
  count?: number;
  rows?: number;
  columns?: number;
  className?: string;
}) {
  const items = useSkeletonItems(count);
  const rowItems = useSkeletonItems(rows);
  const columnItems = useSkeletonItems(columns);
  const toolbarItems = useSkeletonItems(4);

  if (variant === "table-rows")
    return rowItems.map((row) => (
      <TableRow key={row}>
        {columnItems.map((column) => (
          <TableCell key={column} className="h-14">
            {column === 0 && row === 0 && (
              <span className="sr-only" aria-live="polite">Cargando registros…</span>
            )}
            <Skeleton className={`h-4 ${column === 0 ? "w-2/3" : column === 1 ? "w-1/2" : "w-3/4"}`} />
          </TableCell>
        ))}
      </TableRow>
    ));

  if (variant === "summary")
    return (
      <section aria-label="Cargando resumen" aria-busy="true" className={`grid gap-2 sm:grid-cols-2 xl:grid-cols-4 ${className ?? ""}`}>
        {items.map((item) => (
          <div key={item} className="space-y-3 rounded-xl border border-border/80 bg-card px-4 py-3.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </section>
    );

  if (variant === "toolbar")
    return (
      <div aria-label="Cargando controles" aria-busy="true" className={`space-y-3 ${className ?? ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-full sm:w-56" />
          {toolbarItems.map((item) => <Skeleton key={item} className="h-8 w-24" />)}
          <Skeleton className="ml-auto h-8 w-36" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );

  if (variant === "cards")
    return (
      <div role="status" aria-label="Cargando registros" aria-busy="true" className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className ?? ""}`}>
        {items.map((item) => (
          <div key={item} className="overflow-hidden rounded-xl border bg-card">
            <Skeleton className="h-28 rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );

  if (variant === "board")
    return (
      <div role="status" aria-label="Cargando tablero" aria-busy="true" className={`grid gap-3 lg:grid-cols-3 ${className ?? ""}`}>
        {items.slice(0, 3).map((item) => (
          <section key={item} className="min-h-96 space-y-4 rounded-2xl border bg-card/55 p-4">
            <div className="flex items-center justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-20" /></div>
            <div className="flex gap-2"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-6 w-24 rounded-full" /></div>
            <div className="space-y-3">
              {rowItems.slice(0, 2).map((row) => (
                <div key={row} className="space-y-3 rounded-xl border p-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );

  return (
    <div role="status" aria-label="Cargando tabla" aria-busy="true" className={`overflow-hidden rounded-2xl border bg-card ${className ?? ""}`}>
      <div className="flex h-11 items-center gap-4 border-b bg-muted/35 px-4">
        {columnItems.map((column) => <Skeleton key={column} className="h-4 flex-1" />)}
      </div>
      <div className="divide-y">
        {rowItems.map((row) => (
          <div key={row} className="flex h-16 items-center gap-4 px-4">
            {columnItems.map((column) => <Skeleton key={column} className={`h-4 ${column === 0 ? "flex-[1.5]" : "flex-1"}`} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
