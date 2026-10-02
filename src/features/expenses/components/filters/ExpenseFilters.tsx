import { useState } from "react";
import { ListOrdered, SlidersHorizontal, Trash, UserRound, X } from "lucide-react";
import {
  countActiveExpenseFilters,
  hasActiveFilters,
  usesPanel,
} from "../../lib/expense-filters";
import type { ExpenseFilterKey } from "../../types/expense-filters";
import {
  PERSON_ALL,
  PERSON_FILTER_LABELS,
  INSTALLMENT_FILTER_OPTIONS,
} from "../../constants/expense-filters";
import { useExpensePersonOptions } from "../../hooks/useExpensePersonOptions";
import type { ExpenseFiltersProps } from "../../types/expense-filter-props";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { SearchField } from "@/shared/components/filters/SearchField";
import { Button } from "@/ui/button";
import { RecordListToolbar } from "@/shared/components/toolbar/RecordListToolbar";
import { GroupingMenu } from "@/shared/components/toolbar/GroupingMenu";
import { CountedToolbarButton } from "@/shared/components/toolbar/CountedToolbarButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
import { ExpenseFilterFields } from "./ExpenseFilterFields";

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
  const personOptions = useExpensePersonOptions();
  const set = (key: ExpenseFilterKey, next: string | undefined) =>
    onChange({ ...value, [key]: next || undefined });
  const has = (key: ExpenseFilterKey) => fields.includes(key);
  const panel = usesPanel(fields);
  const count = countActiveExpenseFilters(value, fields);
  const width = panel ? "w-full" : undefined;

  const personControl = has("person") && (
    <FilterSelect
      label="Persona"
      icon={UserRound}
      value={value.person ?? PERSON_ALL}
      options={personOptions}
      onChange={(next) => set("person", next)}
      allValue={PERSON_ALL}
      allLabel={PERSON_FILTER_LABELS.ALL}
      width={width}
      searchable={panel && personInPanel}
      labelClassName="text-sm font-medium"
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
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <CountedToolbarButton
              label="Filtros"
              icon={<SlidersHorizontal className="h-4 w-4" />}
              count={count}
              floatingCount={floatingFilterCount}
            />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[min(24rem,calc(100vw-1rem))] overflow-hidden"
          >
            <SheetHeader className="gap-2 pr-10">
              <div className="flex min-w-0 items-center gap-2">
                <SheetTitle className="shrink-0">Filtros</SheetTitle>
                {compactCountInTitle && countLabel && (
                  <span className="truncate text-xs tabular-nums text-muted-foreground">
                    {shown}/{total} registros
                  </span>
                )}
              </div>
              <SheetDescription className="min-w-0">
                <span
                  className="[display:-webkit-box] overflow-hidden whitespace-normal [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                  title={description}
                >
                  {description ??
                    "Filtra los registros y conserva tus opciones en la dirección de la página."}
                </span>
                {!compactCountInTitle && countLabel && (
                  <span className="mt-1 block">
                    {shown} de {total} {countLabel}
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4">
              <div className="flex flex-col gap-3 px-4">{controls}</div>
            </div>
            <SheetFooter className="border-t p-4">
              <Button
                variant="destructive"
                size="sm"
                className="ml-auto h-8 px-3 text-xs"
                disabled={count === 0}
                onClick={() =>
                  onChange(
                    personInPanel
                      ? { q: value.q }
                      : { person: value.person, q: value.q },
                  )
                }
              >
                <Trash className="mr-1 size-3.5" /> Limpiar
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
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
