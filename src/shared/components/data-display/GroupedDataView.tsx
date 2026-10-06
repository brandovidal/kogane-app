import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DataViewProps, DataViewSummary } from "@/shared/types/data-view";
import { useDataTableCalculations } from "@/shared/hooks/useDataTableCalculations";
import { DataView } from "./DataView";

function GroupSection({
  label,
  count,
  summary,
  details,
  children,
  collapsible,
  initiallyOpen,
  primary,
}: {
  label: ReactNode;
  count: number;
  summary?: ReactNode;
  details?: ReactNode;
  children: ReactNode;
  collapsible: boolean;
  initiallyOpen: boolean;
  primary: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
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
      {(!collapsible || open) && children}
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
}) {
  const calculationState = useDataTableCalculations(calculationStorageKey, calculationDefaults);
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
  const renderGroups = (rows: T[], depth: number): ReactNode => {
    const field = fields[depth];
    const groups = new Map<string, T[]>();
    rows.forEach((item) => {
      const key = groupKey(item, field);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });
    return (
      <div className={depth ? "ml-3 space-y-3 border-l pl-3 sm:ml-5 sm:pl-5" : "space-y-4"}>
        {[...groups].map(([key, groupedRows], groupIndex) => {
          const summary = summaryForGroup?.(groupedRows, key, field);
          const content = depth + 1 < fields.length
            ? renderGroups(groupedRows, depth + 1)
            : <DataView
                items={groupedRows}
                columns={columns}
                rowKey={rowKey}
                view={view}
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
              />;
          const collapsible = collapsiblePrimaryGroups && depth === 0;
          return (
            <GroupSection
              key={`${field}:${key}`}
              label={groupLabel(key, field)}
              count={groupedRows.length}
              summary={summary?.label}
              details={groupDetailsFor?.(groupedRows, key, field)}
              collapsible={collapsible}
              initiallyOpen={groupIndex < initialOpenPrimaryGroups}
              primary={depth === primaryGroupDepth}
            >
              {content}
            </GroupSection>
          );
        })}
      </div>
    );
  };
  return (
    <div className="space-y-4">
      {renderGroups(items, 0)}
      {footer && <div className="rounded-md border px-4 py-3">{footer}</div>}
    </div>
  );
}
