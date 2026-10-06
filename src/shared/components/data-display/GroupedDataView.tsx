import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import type { DataViewProps, DataViewSummary } from "@/shared/types/data-view";
import { useDataTableCalculations } from "@/shared/hooks/useDataTableCalculations";
import { DataView } from "./DataView";
import { DATA_TABLE_PAGE_SIZE, DATA_TABLE_PAGE_SIZES } from "@/shared/constants/data-table";
import { Button } from "@/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

function GroupSection<T>({
  label,
  count,
  summary,
  details,
  children,
  rows,
  paginate,
  groupId,
  onPaginationVisibilityChange,
  collapsible,
  initiallyOpen,
  primary,
}: {
  label: ReactNode;
  count: number;
  summary?: ReactNode;
  details?: ReactNode;
  children: (rows: T[], paginationFooter?: ReactNode) => ReactNode;
  rows: T[];
  paginate: boolean;
  groupId: string;
  onPaginationVisibilityChange?: (groupId: string, hidden: boolean) => void;
  collapsible: boolean;
  initiallyOpen: boolean;
  primary: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DATA_TABLE_PAGE_SIZE);
  const [paginationHidden, setPaginationHidden] = useState(false);
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const visibleRows = paginate && !paginationHidden
    ? rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : rows;
  const from = count ? currentPage * pageSize + 1 : 0;
  const to = Math.min((currentPage + 1) * pageSize, count);
  const paginationFooter = paginate ? (
    paginationHidden ? (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{count} de {count} registros · paginación oculta</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-brand"
          aria-label="Mostrar paginación del grupo"
          onClick={() => {
            setPaginationHidden(false);
            onPaginationVisibilityChange?.(groupId, false);
          }}
        >
          <Eye aria-hidden="true" className="size-3.5" />
          Mostrar paginación
        </Button>
      </div>
    ) : (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span aria-live="polite">{from}–{to} de {count} registros</span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-2">
            <span>Por página</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
            >
              <SelectTrigger size="sm" aria-label="Registros por página del grupo" className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATA_TABLE_PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="whitespace-nowrap">Página {currentPage + 1} de {pageCount}</span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Página anterior del grupo"
              disabled={currentPage === 0}
              onClick={() => setPageIndex(currentPage - 1)}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Página siguiente del grupo"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPageIndex(currentPage + 1)}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2"
            onClick={() => {
              setPaginationHidden(true);
              setPageIndex(0);
              onPaginationVisibilityChange?.(groupId, true);
            }}
          >
            <EyeOff aria-hidden="true" className="size-3.5" />
            Ocultar paginación
          </Button>
        </div>
      </div>
    )
  ) : undefined;
  const heading = (
    <>
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {collapsible && (open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />)}
        <span className="truncate">{label}</span>
        <span className="inline-flex shrink-0 items-center rounded-full border border-border/80 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {count} {count === 1 ? "gasto" : "gastos"}
        </span>
        {details}
      </span>
      {summary}
    </>
  );

  return (
    <section className="space-y-2">
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${primary ? "text-base font-bold tracking-tight" : "text-sm font-medium"}`}
        >
          {heading}
        </button>
      ) : (
        <h2 className={`flex items-baseline justify-between gap-3 ${primary ? "text-base font-bold tracking-tight" : "text-sm font-medium"}`}>
          {heading}
        </h2>
      )}
      {(!collapsible || open) && children(visibleRows, paginationFooter)}
    </section>
  );
}

export function GroupedDataView<T>({
  items,
  columns,
  rowKey,
  view,
  groupBy = "none",
  groupKey,
  groupLabel,
  primaryGroupDepth = 0,
  summaryForGroup,
  groupDetailsFor,
  collapsiblePrimaryGroups = false,
  initialOpenPrimaryGroups = 1,
  paginatePrimaryGroups = false,
  comparePrimaryGroups,
  calculationStorageKey,
  calculationDefaults,
  tableClassName,
  footer,
  extraCard,
  compactCards,
  cardRenderer,
  selected,
  onSelectedChange,
  selectionDisabled,
}: DataViewProps<T> & {
  groupBy?: string | readonly string[];
  groupKey: (item: T, field: string) => string;
  groupLabel: (key: string, field: string) => ReactNode;
  primaryGroupDepth?: number;
  summaryForGroup?: (items: T[], key?: string, field?: string) => DataViewSummary;
  groupDetailsFor?: (items: T[], key: string, field: string) => ReactNode;
  collapsiblePrimaryGroups?: boolean;
  initialOpenPrimaryGroups?: number;
  paginatePrimaryGroups?: boolean;
  comparePrimaryGroups?: (left: T[], right: T[]) => number;
}) {
  const calculationState = useDataTableCalculations(calculationStorageKey, calculationDefaults);
  const [hiddenPaginationGroups, setHiddenPaginationGroups] = useState<
    Map<string, string>
  >(() => new Map());
  const fields = Array.isArray(groupBy)
    ? groupBy
    : groupBy === "none"
      ? []
      : [groupBy];
  if (!fields.length)
    return (
      <DataView
        items={items}
        columns={columns}
        rowKey={rowKey}
        view={view}
        footer={footer}
        summary={summaryForGroup?.(items)}
        calculationStorageKey={calculationStorageKey}
        calculationDefaults={calculationDefaults}
        tableClassName={tableClassName}
        calculationState={calculationState}
        extraCard={extraCard}
        compactCards={compactCards}
        cardRenderer={cardRenderer}
        selected={selected}
        onSelectedChange={onSelectedChange}
        selectionDisabled={selectionDisabled}
      />
    );
  let firstGroup = true;
  let primaryGroupCount = 0;
  const renderGroups = (rows: T[], depth: number): ReactNode => {
    const field = fields[depth];
    const groups = new Map<string, T[]>();
    rows.forEach((item) => {
      const key = groupKey(item, field);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });
    const orderedGroups = [...groups].sort(([, left], [, right]) =>
      depth === 0 && comparePrimaryGroups
        ? comparePrimaryGroups(left, right)
        : 0,
    );
    if (depth === 0) primaryGroupCount = orderedGroups.length;
    return (
      <div className={depth ? "ml-3 space-y-3 border-l pl-3 sm:ml-5 sm:pl-5" : "space-y-4"}>
        {orderedGroups.map(([key, groupedRows], groupIndex) => {
          const summary = summaryForGroup?.(groupedRows, key, field);
          const collapsible = collapsiblePrimaryGroups && depth === 0;
          return (
            <GroupSection<T>
              key={`${field}:${key}`}
              label={groupLabel(key, field)}
              count={groupedRows.length}
              summary={summary?.label}
              details={groupDetailsFor?.(groupedRows, key, field)}
              collapsible={collapsible}
              initiallyOpen={groupIndex < initialOpenPrimaryGroups}
              primary={depth === primaryGroupDepth}
              rows={groupedRows}
              paginate={paginatePrimaryGroups && depth === 0}
              groupId={key}
              onPaginationVisibilityChange={(groupId, hidden) => {
                setHiddenPaginationGroups((current) => {
                  const next = new Map(current);
                  if (hidden) next.set(groupId, String(groupLabel(groupId, field)));
                  else next.delete(groupId);
                  return next;
                });
              }}
            >
              {(visibleRows, paginationFooter) => depth + 1 < fields.length ? (
                <div className="space-y-3">
                  {renderGroups(visibleRows, depth + 1)}
                  {paginationFooter && (
                    <div className="rounded-xl border bg-card px-4 py-3">
                      {paginationFooter}
                    </div>
                  )}
                </div>
              ) : (
                <DataView
                    items={visibleRows}
                    columns={columns}
                    rowKey={rowKey}
                    view={view}
                    footer={
                      view === "cards" && paginationFooter ? (
                        <div className="rounded-xl border bg-card px-4 py-3">
                          {paginationFooter}
                        </div>
                      ) : paginationFooter
                    }
                    summary={undefined}
                    calculationStorageKey={calculationStorageKey}
                    calculationDefaults={calculationDefaults}
                    tableClassName={tableClassName}
                    calculationState={calculationState}
                    extraCard={firstGroup ? (firstGroup = false, extraCard) : undefined}
                    compactCards={compactCards}
                    cardRenderer={cardRenderer}
                    selected={selected}
                    onSelectedChange={onSelectedChange}
                    selectionDisabled={selectionDisabled}
                  />
              )}
            </GroupSection>
          );
        })}
      </div>
    );
  };
  return (
    <div className="space-y-4">
      {renderGroups(items, 0)}
      {paginatePrimaryGroups && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            {footer ?? "Agrupado por mes · más recientes primero · cada mes se pagina por separado"}
          </span>
          <span>
            {items.length} registros · Paginación por mes: {hiddenPaginationGroups.size === primaryGroupCount ? "oculta" : "visible"}
            {hiddenPaginationGroups.size > 0 && (
              <> ({[...hiddenPaginationGroups.values()].join(", ")} {hiddenPaginationGroups.size === 1 ? "oculta" : "ocultos"})</>
            )}
          </span>
        </div>
      )}
      {footer && !paginatePrimaryGroups && (
        <div className="rounded-md border px-4 py-3">{footer}</div>
      )}
    </div>
  );
}
