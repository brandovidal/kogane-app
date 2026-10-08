import { useState } from "react";
import { ListOrdered, SlidersHorizontal, X } from "lucide-react";
import {
  countActiveExpenseFilters,
  hasActiveFilters,
  usesPanel,
} from "../../lib/expense-filters";
import type { ExpenseFilterKey } from "../../types/expense-filters";
import { INSTALLMENT_FILTER_OPTIONS } from "../../constants/expense-filters";
import type { ExpenseFiltersProps } from "../../types/expense-filter-props";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { SearchField } from "@/shared/components/filters/SearchField";
import { Button } from "@/ui/button";
import { RecordListToolbar } from "@/shared/components/toolbar/RecordListToolbar";
import { GroupingMenu } from "@/shared/components/toolbar/GroupingMenu";
import { CountedToolbarButton } from "@/shared/components/toolbar/CountedToolbarButton";
import { ExpenseFilterFields } from "./ExpenseFilterFields";
import { ExpensePersonFilter } from "./ExpensePersonFilter";
import { ExpenseFiltersPanel } from "./ExpenseFiltersPanel";

export function ExpenseFilters({
  fields,
  value,
  onChange,
  statuses,
  shown,
  total,
  groupBy,
  onGroupByChange,
  groupByOptions,
  personInPanel = false,
  description,
  countLabel,
  compactCountInTitle = false,
  floatingFilterCount = false,
  searchInPanel = false,
  primaryControls,
  rightActions,
  appliedFilters,
  viewToggle,
  showActiveSummary = true,
}: ExpenseFiltersProps) {
  const [open, setOpen] = useState(false);
  const set = (key: ExpenseFilterKey, next: string | undefined) =>
    onChange({ ...value, [key]: next || undefined });
  const has = (key: ExpenseFilterKey) => fields.includes(key);
  const panel = usesPanel(fields);
  const count = countActiveExpenseFilters(value, fields);

  const personControl = has("person") && (
    <ExpensePersonFilter
      compact
      value={value.person}
      onChange={(next) => set("person", next)}
    />
  );

  const controls = (
    <ExpenseFilterFields
      fields={fields}
      value={value}
      onChange={onChange}
      statuses={statuses}
      panel={panel}
      personInPanel={personInPanel}
      searchInPanel={searchInPanel}
    />
  );

  const search = has("q") && (
    <SearchField
      className={`${searchInPanel ? "hidden lg:block " : ""}w-full sm:w-56 sm:shrink-0`}
      placeholder="Buscar..."
      value={value.q ?? ""}
      onChange={(next) => set("q", next)}
    />
  );
  const actions = (
    <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
      {has("person") && !personInPanel && personControl}
      {has("installments") && (
        <FilterSelect
          label="Cuota"
          icon={ListOrdered}
          value={value.installments}
          options={INSTALLMENT_FILTER_OPTIONS}
          onChange={(next) => set("installments", next)}
          width="w-[145px]"
          labelClassName="text-sm font-medium"
        />
      )}
      {panel ? (
        <ExpenseFiltersPanel
          open={open}
          onOpenChange={setOpen}
          trigger={
            <CountedToolbarButton
              label="Filtros"
              icon={<SlidersHorizontal className="h-4 w-4" />}
              count={count}
              floatingCount={floatingFilterCount}
            />
          }
          description={description}
          shown={shown}
          total={total}
          countLabel={countLabel}
          compactCountInTitle={compactCountInTitle}
          count={count}
          onClear={() =>
            onChange(
              personInPanel
                ? { q: value.q }
                : { person: value.person, q: value.q },
            )
          }
        >
          {controls}
        </ExpenseFiltersPanel>
      ) : (
        controls
      )}
      {groupByOptions && onGroupByChange && (
        <GroupingMenu
          value={groupBy ?? "none"}
          onChange={onGroupByChange}
          options={groupByOptions}
        />
      )}
      {rightActions}
      {showActiveSummary && hasActiveFilters(value) && (
        <>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar
          </Button>
          <span className="text-xs text-muted-foreground">
            {shown} de {total}
          </span>
        </>
      )}
    </div>
  );
  return (
    <RecordListToolbar
      primary={
        primaryControls ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            {search}
            <div className="w-full min-w-0 sm:w-max sm:shrink-0">
              {primaryControls}
            </div>
          </div>
        ) : (
          search
        )
      }
      primaryClassName={
        primaryControls ? "sm:min-w-[min(100%,32rem)]" : undefined
      }
      actions={actions}
      applied={appliedFilters}
      view={viewToggle}
    />
  );
}
